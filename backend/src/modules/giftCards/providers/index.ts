import { env } from '../../../config/env';
import { AppError } from '../../../shared/errors/AppError';
import { ManualInventoryGiftCardProvider } from './manualInventoryProvider';
import type { GiftCardProvider } from './gift-card-provider';

export * from './gift-card-provider';

/**
 * Fábrica do provider conforme GIFT_CARD_PROVIDER. Hoje só `manual_inventory`
 * está implementado — Todo/InComm, Incentive.me, Ding, iFood Card são
 * pendência comercial (fornecedor ainda não escolhido).
 */
export function buildGiftCardProvider(): GiftCardProvider {
  switch (env.GIFT_CARD_PROVIDER) {
    case 'manual_inventory':
      return new ManualInventoryGiftCardProvider();
    default:
      throw new AppError(
        `GiftCardProvider "${env.GIFT_CARD_PROVIDER}" ainda não implementado.`,
        500,
        'gift_card_provider_not_implemented',
      );
  }
}

/** Instância única usada pela aplicação. */
export const giftCardProvider: GiftCardProvider = buildGiftCardProvider();
