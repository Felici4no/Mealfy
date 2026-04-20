import type { Donation, GiftCard, Family, BigDonationResult } from '../types';
import { mockDonations, mockGiftCards } from '../mockData/donations';
import { familyService } from './familyService';
import { storage } from '../utils/storage';
import { randomDelay } from '../utils/delay';

const DONATIONS_KEY = 'donations_db';
const GIFTCARDS_KEY = 'giftcards_db';

export const donationService = {
  initDB: () => {
    if (!storage.get(DONATIONS_KEY, null)) {
      storage.set(DONATIONS_KEY, mockDonations);
    }
    if (!storage.get(GIFTCARDS_KEY, null)) {
      storage.set(GIFTCARDS_KEY, mockGiftCards);
    }
  },

  generateGiftCard: async (payload: { amount: number, familyId: string, donorId: string }): Promise<GiftCard> => {
    await randomDelay(200, 500);
    donationService.initDB();
    
    const providers = ['Itaú Alimentação', 'Mercado Parceiro Local', 'Ticket Alimentação Solidário'];
    const randomProvider = providers[Math.floor(Math.random() * providers.length)];

    const newGiftCard: GiftCard = {
      id: `gc-${Date.now()}`,
      familyId: payload.familyId,
      donorId: payload.donorId,
      amount: payload.amount,
      createdAt: new Date().toISOString(),
      status: 'generated',
      label: `Gift Card Apoio Alimentar — R$${payload.amount}`,
      provider: randomProvider
    };

    const cards = storage.get<GiftCard[]>(GIFTCARDS_KEY, mockGiftCards);
    cards.push(newGiftCard);
    storage.set(GIFTCARDS_KEY, cards);

    return newGiftCard;
  },

  createDonation: async (payload: { 
    amount: number; 
    communityId: string; 
    donorId?: string; // Optional if anonymous
    message?: string;
  }): Promise<{ donation: Donation, giftCard: GiftCard, familyAssigned: Family }> => {
    await randomDelay(1000, 2000); // Simulate transaction
    donationService.initDB();

    // The user rules:
    // 1. doação nasce na comunidade, atribui a uma família
    // prioritize family with needs_help in that community
    const families = await familyService.getFamiliesByCommunity(payload.communityId);
    let selectedFamily = families.find(f => f.supportStatus === 'needs_help');
    
    // Fallback if everyone is supported (edge case)
    if (!selectedFamily && families.length > 0) {
      selectedFamily = families[0];
    } else if (families.length === 0) {
      throw new Error("No families found in this community");
    }

    // Generate Gift Card
    const donorId = payload.donorId || `anon-${Date.now()}`;
    const giftCard = await donationService.generateGiftCard({
      amount: payload.amount,
      familyId: selectedFamily!.id,
      donorId
    });

    // Create Donation Record
    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      donorId,
      familyId: selectedFamily!.id,
      communityId: payload.communityId,
      amount: payload.amount,
      giftCardId: giftCard.id,
      createdAt: new Date().toISOString(),
      message: payload.message
    };

    // Save donation no matter if anonymous or not
    const donations = storage.get<Donation[]>(DONATIONS_KEY, mockDonations);
    donations.push(newDonation);
    storage.set(DONATIONS_KEY, donations);

    // ONLY Update Session total if the donor is NOT anonymous
    if (payload.donorId) {
      const USERS_KEY = 'users_db';
      const sessionUser = storage.get<any>('current_user', null);
      if (sessionUser && sessionUser.id === payload.donorId) {
         sessionUser.totalDonated += payload.amount;
         storage.set('current_user', sessionUser);
         const users = storage.get<any[]>(USERS_KEY, []);
         const idx = users.findIndex(u => u.id === sessionUser.id);
         if (idx !== -1) {
            users[idx].totalDonated += payload.amount;
            storage.set(USERS_KEY, users);
         }
      }
    }

    // Update Family Status
    const familyAssigned = await familyService.updateFamilyStatus(selectedFamily!.id, 'supported');

    return { donation: newDonation, giftCard, familyAssigned };
  },

  getDonationHistoryByUser: async (userId: string): Promise<{donation: Donation, giftCard: GiftCard}[]> => {
    await randomDelay(400, 800);
    donationService.initDB();
    const donations = storage.get<Donation[]>(DONATIONS_KEY, mockDonations).filter(d => d.donorId === userId);
    const giftCards = storage.get<GiftCard[]>(GIFTCARDS_KEY, mockGiftCards);
    
    return donations.map(don => {
      const gc = giftCards.find(g => g.id === don.giftCardId);
    return {
      donation: don,
      giftCard: gc!
    }
  }).reverse(); // Latest first
},

createBigDonation: async (payload: {
  totalAmount: number;
  communityId: string;
  donorId: string;
}): Promise<BigDonationResult> => {
  await randomDelay(1000, 2000);
  donationService.initDB();

  // Find eligible families
  const families = await familyService.getFamiliesByCommunity(payload.communityId);
  const eligibleFamilies = families.filter(f => f.supportStatus === 'needs_help');

  if (eligibleFamilies.length === 0) {
    throw new Error('Nenhuma família carente no momento nesta região.');
  }

  // Distribute equally (in reality, it amplifies support if less families)
  const perFamilyAmount = Math.floor(payload.totalAmount / eligibleFamilies.length);
  
  const donations: Donation[] = [];
  const giftCards: GiftCard[] = [];
  const familyIds: string[] = [];

  for (const family of eligibleFamilies) {
    const gc = await donationService.generateGiftCard({
      amount: perFamilyAmount,
      familyId: family.id,
      donorId: payload.donorId
    });

    const don: Donation = {
      id: `bigdon-${Date.now()}-${family.id}`,
      donorId: payload.donorId,
      familyId: family.id,
      communityId: payload.communityId,
      amount: perFamilyAmount,
      giftCardId: gc.id,
      createdAt: new Date().toISOString(),
      message: 'Apoio Regional Ampliado'
    };

    const dones = storage.get<Donation[]>(DONATIONS_KEY, mockDonations);
    dones.push(don);
    storage.set(DONATIONS_KEY, dones);

    donations.push(don);
    giftCards.push(gc);
    familyIds.push(family.id);

    // Update Status
    await familyService.updateFamilyStatus(family.id, 'supported');
  }

  // Update user global total
  const USERS_KEY = 'users_db';
  const sessionUser = storage.get<any>('current_user', null);
  if (sessionUser && sessionUser.id === payload.donorId) {
     sessionUser.totalDonated += payload.totalAmount;
     storage.set('current_user', sessionUser);
     const users = storage.get<any[]>(USERS_KEY, []);
     const idx = users.findIndex(u => u.id === sessionUser.id);
     if (idx !== -1) {
        users[idx].totalDonated += payload.totalAmount;
        storage.set(USERS_KEY, users);
     }
  }

  let supportTierDesc = 'Apoio Massivo Distribuído';
  if (eligibleFamilies.length <= 2 && payload.totalAmount > 200) {
    supportTierDesc = 'Apoio Extraordinário Focado';
  }

  return {
    communityId: payload.communityId,
    totalDistributedAmount: payload.totalAmount,
    impactedFamiliesCount: eligibleFamilies.length,
    familyIds,
    donations,
    giftCards,
    supportTierDesc
  };
}
};
