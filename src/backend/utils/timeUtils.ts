import type { Family } from '../types';

/**
 * Checks if a beneficiary is eligible to receive a donation.
 * Rules:
 * - Must be approved.
 * - Must not have been fed in the last 24h OR if it's past 08:00 AM of the next day.
 * - For simplicity in this mock, we use a strict 24h rule OR the "next day at 8am" logic.
 */
export const isBeneficiaryEligible = (beneficiary: Family): boolean => {
  // If not approved, not eligible
  if (beneficiary.status && beneficiary.status !== 'approved' && beneficiary.status !== 'needs_help') {
    // Note: 'needs_help' is the legacy status, treating it as approved for existing data
    if (beneficiary.supportStatus === 'supported' || beneficiary.supportStatus === 'fed') {
       // continue to time check
    } else {
       return beneficiary.supportStatus === 'needs_help';
    }
  }

  if (!beneficiary.lastFedAt) return true;

  const lastFed = new Date(beneficiary.lastFedAt);
  const now = new Date();

  // Rule: Reset at 08:00 AM
  const resetTime = new Date(now);
  resetTime.setHours(8, 0, 0, 0);

  // If we are currently past 8 AM today
  if (now >= resetTime) {
    // If they were fed BEFORE 8 AM today, they are eligible now
    return lastFed < resetTime;
  } else {
    // If we are BEFORE 8 AM today, we check if they were fed BEFORE 8 AM yesterday
    const yesterdayReset = new Date(resetTime);
    yesterdayReset.setDate(yesterdayReset.getDate() - 1);
    return lastFed < yesterdayReset;
  }
};

export const getNextEligibilityTime = (beneficiary: Family): string => {
  if (isBeneficiaryEligible(beneficiary)) return "Agora";

  const now = new Date();
  const tomorrow8am = new Date(now);
  tomorrow8am.setDate(tomorrow8am.getDate() + 1);
  tomorrow8am.setHours(8, 0, 0, 0);

  return tomorrow8am.toISOString();
};
