export type UrgencyColor = 'error' | 'warning' | 'success';
export type SupportStatus = 'needs_help' | 'supported';
export type GiftCardStatus = 'generated' | 'sent' | 'redeemed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalDonated: number;
  rankingPosition: number;
  rankingPercentile: string;
  favoriteCommunityId?: string;
}

export interface Community {
  id: string;
  name: string;
  region: string;
  description: string;
  distance: string;
  familiesTotal: number;
  familiesInNeed: number;
  priority: string;
  urgencyColor: UrgencyColor;
  imageUrl?: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  school: string;
  grade?: string;
}

export interface Family {
  id: string;
  communityId: string;
  representativeName: string;
  neighborhood: string;
  city: string;
  state: string;
  shortAddress: string;
  description: string;
  childrenCount: number;
  children: Child[];
  mainNeed: string;
  supportStatus: SupportStatus;
  distanceToUser: string;
  priorityLevel: number; // 1 to 5 (highest)
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

export interface GiftCard {
  id: string;
  familyId: string;
  donorId: string;
  amount: number;
  createdAt: string;
  status: GiftCardStatus;
  label: string;
  provider: string; // e.g. "Mercado Parceiro Local"
}

export interface Donation {
  id: string;
  donorId: string;
  familyId: string;
  communityId: string;
  amount: number;
  giftCardId: string;
  createdAt: string;
  message?: string;
}

export interface Recurrence {
  id: string;
  userId: string;
  communityId?: string; // Optional if targeting a specific family or region
  familyId?: string; 
  amount: number;
  periodicity: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'paused';
  nextBillingDate: string;
  totalAccumulated: number;
}

export interface BigDonationResult {
  communityId: string;
  totalDistributedAmount: number;
  impactedFamiliesCount: number;
  familyIds: string[];
  donations: Donation[];
  giftCards: GiftCard[];
  supportTierDesc: string;
}
