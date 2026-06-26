import type { PaymentStatus } from '@prisma/client';

export interface CreatePixInput {
  amount: number; // centavos
  donationId: string;
  expiresInMinutes: number;
}

export interface PixCharge {
  externalPaymentId: string;
  pixQrCode: string;
  pixCopyPaste: string;
  expiresAt: Date;
}

export interface WebhookEvent {
  externalEventId: string;
  externalPaymentId: string;
  type: string;
  status: PaymentStatus;
  raw: unknown;
}

/**
 * Contrato do gateway de pagamento. No MVP só existe o MockPix; quando um gateway
 * real for escolhido (Fase 5+), basta criar `RealPixProvider implements PaymentProvider`.
 */
export interface PaymentProvider {
  readonly name: string;
  createPixPayment(input: CreatePixInput): Promise<PixCharge>;
  getPaymentStatus(externalPaymentId: string): Promise<PaymentStatus>;
  /** Verifica assinatura do webhook e devolve o evento normalizado. Lança se inválido. */
  verifyAndParseWebhook(rawBody: string, signature: string | undefined): WebhookEvent;
}
