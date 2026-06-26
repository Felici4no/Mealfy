import { env } from '../../../config/env';
import { MockPixProvider } from './mockPixProvider';
import type { PaymentProvider } from './paymentProvider';

export * from './paymentProvider';

/** Fábrica do provider conforme PAYMENT_PROVIDER. Hoje só `mock`. */
export function buildPaymentProvider(): PaymentProvider {
  switch (env.PAYMENT_PROVIDER) {
    case 'mock':
    default:
      return new MockPixProvider();
  }
}

/** Instância única usada pela aplicação. */
export const paymentProvider: PaymentProvider = buildPaymentProvider();
