import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../config/env';
import { paymentProvider } from './providers';
import { finalizeDonationAfterPayment } from '../donations/donations.service';
import { createAuditLog } from '../auditLogs/auditLog.service';
import type { UserRole } from '@prisma/client';
import type { WebhookEvent } from './providers';

/** Cria a cobrança Pix (mock) para uma doação e vincula o pagamento à doação. */
export async function createPixChargeForDonation(donationId: string, amount: number) {
  const charge = await paymentProvider.createPixPayment({
    donationId,
    amount,
    expiresInMinutes: env.PIX_EXPIRATION_MINUTES,
  });
  const payment = await prisma.payment.create({
    data: {
      donationId,
      provider: paymentProvider.name,
      method: 'pix',
      status: 'pending',
      amount,
      pixQrCode: charge.pixQrCode,
      pixCopyPaste: charge.pixCopyPaste,
      externalPaymentId: charge.externalPaymentId,
      expiresAt: charge.expiresAt,
    },
  });
  await prisma.donation.update({ where: { id: donationId }, data: { paymentId: payment.id } });
  return payment;
}

export async function getPaymentForActor(actor: { userId: string; role: UserRole }, paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new AppError('Pagamento não encontrado', 404, 'payment_not_found');
  if (actor.role === 'admin') return payment;
  if (actor.role === 'donor') {
    const donation = await prisma.donation.findUnique({
      where: { id: payment.donationId },
      select: { donorId: true },
    });
    if (donation?.donorId === actor.userId) return payment;
  }
  throw new AppError('Acesso negado', 403, 'forbidden');
}

/**
 * Processa um evento de pagamento de forma IDEMPOTENTE.
 * A unicidade de PaymentEvent.externalEventId garante que o mesmo evento não
 * seja processado duas vezes (mesmo sob corrida).
 */
export async function processWebhookEvent(evt: WebhookEvent) {
  const payment = await prisma.payment.findUnique({ where: { externalPaymentId: evt.externalPaymentId } });
  if (!payment) {
    // pagamento desconhecido — não vaza nada; webhook responde 200 (ignorado)
    return { status: 'ignored_unknown_payment' as const };
  }

  // Idempotência: registra o evento; se já existir (mesmo externalEventId), no-op.
  try {
    await prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        externalEventId: evt.externalEventId,
        eventType: evt.type,
        payload: evt.raw as object,
        processedAt: new Date(),
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { status: 'duplicate_ignored' as const };
    }
    throw e;
  }

  if (evt.status === 'paid') {
    await finalizeDonationAfterPayment(payment.donationId, null);
    await createAuditLog({
      action: 'payment_webhook_paid',
      entityType: 'payment',
      entityId: payment.id,
      metadata: { donationId: payment.donationId, externalEventId: evt.externalEventId },
    });
    return { status: 'processed_paid' as const };
  }

  if (evt.status === 'expired' || evt.status === 'failed' || evt.status === 'canceled') {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: evt.status } });
    return { status: 'processed_other' as const };
  }

  return { status: 'processed_noop' as const };
}
