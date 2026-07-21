import type { GiftCardProvider as CardBrand, GiftCardProviderName } from '@prisma/client';

export type { GiftCardProviderName };

export interface GiftCardCatalogItem {
  provider: CardBrand;
  label: string;
  available: boolean;
  stockCount?: number;
}

export interface CheckAvailabilityInput {
  provider: CardBrand;
  amount: number; // centavos
}

export interface CheckAvailabilityOutput {
  available: boolean;
  stockCount?: number;
}

export interface PurchaseGiftCardInput {
  provider: CardBrand; // marca do cartão (ifood/ninetynine/carrefour)
  amount: number; // centavos
  currency: string; // 'BRL'
  donationId: string;
  familyId: string;
  beneficiaryUserId?: string | null;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface PurchaseGiftCardOutput {
  externalOrderId: string | null;
  provider: CardBrand;
  brand: string; // rótulo legível (ex.: "iFood", "99 Mercado", "Carrefour")
  amount: number;
  currency: string;
  code: string; // sempre em texto puro aqui — quem persiste é responsável por cifrar
  pin?: string;
  expiresAt?: Date;
  redeemUrl?: string;
  instructions?: string;
  /** Preenchido SÓ pelo ManualInventoryGiftCardProvider: id do GiftCard já existente que foi reclamado do estoque (available->used). Outros providers deixam undefined — quem orquestra cria um GiftCard novo a partir do código retornado. */
  existingGiftCardId?: string;
  raw?: unknown;
}

/**
 * Contrato para obter um gift card — de estoque importado manualmente hoje,
 * de um fornecedor externo real no futuro (Todo/InComm, Incentive.me etc. —
 * pendência comercial, nenhum implementado ainda). Trocar de fornecedor
 * nunca deve exigir mudar `DonationFulfillmentService`.
 */
export interface GiftCardProvider {
  readonly name: GiftCardProviderName;
  getCatalog(): Promise<GiftCardCatalogItem[]>;
  getProductsByProvider(provider: CardBrand): Promise<GiftCardCatalogItem[]>;
  checkAvailability(input: CheckAvailabilityInput): Promise<CheckAvailabilityOutput>;
  /** Nunca deve ser chamado antes do pagamento estar confirmado. */
  purchaseGiftCard(input: PurchaseGiftCardInput): Promise<PurchaseGiftCardOutput>;
  getOrderStatus(externalOrderId: string): Promise<string | null>;
  /** Opcional — só se o fornecedor permitir cancelar um pedido já feito. */
  cancelOrder?(externalOrderId: string): Promise<void>;
}
