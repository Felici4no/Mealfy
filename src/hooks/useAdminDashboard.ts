import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  usersByRole: {
    donors: number;
    entities: number;
    beneficiaries: number;
    admins: number;
  };
  usersByStatus: {
    pending: number;
    approved: number;
    active: number;
    rejected: number;
    suspended: number;
  };
  familiesByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
  familiesBySupportStatus: {
    needs_help: number;
    fed: number;
    supported: number;
  };
  donations: {
    total: number;
    totalAmount: number;
  };
  communities: {
    total: number;
    totalFamilies: number;
    totalFamiliesInNeed: number;
  };
  pendingIndications: number;
  pendingEntities: number;
}

export interface DonorRanking {
  id: string;
  name: string;
  total_donated: number;
  avatar?: string;
}

export interface PendingIndication {
  id: string;
  representative_name: string;
  region: string;
  children_count: number;
  observation: string | null;
  created_at: string;
}

export interface PendingEntity {
  id: string;
  name: string;
  cnpj: string;
  type: string;
  responsible_name: string;
  email: string;
  region: string;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [donorRanking, setDonorRanking] = useState<DonorRanking[]>([]);
  const [pendingIndications, setPendingIndications] = useState<PendingIndication[]>([]);
  const [pendingEntities, setPendingEntities] = useState<PendingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        usersResult,
        familiesResult,
        donationsResult,
        communitiesResult,
        indicationsResult,
        entitiesResult,
      ] = await Promise.all([
        supabase.from('users').select('role, status'),
        supabase.from('families').select('status, support_status'),
        supabase.from('donations').select('amount'),
        supabase.from('communities').select('families_total, families_in_need'),
        supabase.from('donor_indications').select('id, representative_name, region, children_count, observation, created_at').eq('status', 'pending'),
        supabase.from('authorizing_entities').select('id, name, cnpj, type, responsible_name, email, region').eq('status', 'pending'),
      ]);

      // Check for errors
      if (usersResult.error) throw usersResult.error;
      if (familiesResult.error) throw familiesResult.error;
      if (donationsResult.error) throw donationsResult.error;
      if (communitiesResult.error) throw communitiesResult.error;
      if (indicationsResult.error) throw indicationsResult.error;
      if (entitiesResult.error) throw entitiesResult.error;

      const users = usersResult.data || [];
      const families = familiesResult.data || [];
      const donations = donationsResult.data || [];
      const communities = communitiesResult.data || [];
      const indications = indicationsResult.data || [];
      const entities = entitiesResult.data || [];

      // Calculate stats
      const stats: DashboardStats = {
        usersByRole: {
          donors: users.filter(u => u.role === 'donor').length,
          entities: users.filter(u => u.role === 'entity').length,
          beneficiaries: users.filter(u => u.role === 'beneficiary').length,
          admins: users.filter(u => u.role === 'admin').length,
        },
        usersByStatus: {
          pending: users.filter(u => u.status === 'pending').length,
          approved: users.filter(u => u.status === 'approved').length,
          active: users.filter(u => u.status === 'active').length,
          rejected: users.filter(u => u.status === 'rejected').length,
          suspended: users.filter(u => u.status === 'suspended').length,
        },
        familiesByStatus: {
          pending: families.filter(f => f.status === 'pending').length,
          approved: families.filter(f => f.status === 'approved').length,
          rejected: families.filter(f => f.status === 'rejected').length,
          suspended: families.filter(f => f.status === 'suspended').length,
        },
        familiesBySupportStatus: {
          needs_help: families.filter(f => f.support_status === 'needs_help').length,
          fed: families.filter(f => f.support_status === 'fed').length,
          supported: families.filter(f => f.support_status === 'supported').length,
        },
        donations: {
          total: donations.length,
          totalAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
        },
        communities: {
          total: communities.length,
          totalFamilies: communities.reduce((sum, c) => sum + (c.families_total || 0), 0),
          totalFamiliesInNeed: communities.reduce((sum, c) => sum + (c.families_in_need || 0), 0),
        },
        pendingIndications: indications.length,
        pendingEntities: entities.length,
      };

      setStats(stats);
      setPendingIndications(indications);
      setPendingEntities(entities);

      // Fetch donor ranking
      const { data: rankingData, error: rankingError } = await supabase
        .from('users')
        .select('id, name, total_donated, avatar')
        .eq('role', 'donor')
        .order('total_donated', { ascending: false })
        .limit(10);

      if (rankingError) throw rankingError;
      setDonorRanking(rankingData || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    donorRanking,
    pendingIndications,
    pendingEntities,
    loading,
    error,
    refresh: fetchDashboardData,
  };
}

export async function approveIndication(indicationId: string) {
  const { error } = await supabase
    .from('donor_indications')
    .update({ status: 'approved' })
    .eq('id', indicationId);

  if (error) throw error;
}

export async function rejectIndication(indicationId: string) {
  const { error } = await supabase
    .from('donor_indications')
    .update({ status: 'rejected' })
    .eq('id', indicationId);

  if (error) throw error;
}

export async function convertIndicationToFamily(indicationId: string) {
  // Get the indication first
  const { data: indication, error: fetchError } = await supabase
    .from('donor_indications')
    .select('*')
    .eq('id', indicationId)
    .single();

  if (fetchError) throw fetchError;
  if (!indication) throw new Error('Indication not found');

  // Create family from indication
  const { error: insertError } = await supabase
    .from('families')
    .insert({
      representative_name: indication.representative_name,
      region: indication.region,
      children_count: indication.children_count,
      status: 'approved',
      support_status: 'needs_help',
      source_type: 'donor_indication',
      source_label: 'Convertido de Indicacao',
      original_indication_id: indicationId,
      priority_level: 2,
    });

  if (insertError) throw insertError;

  // Update indication status
  const { error: updateError } = await supabase
    .from('donor_indications')
    .update({ status: 'converted' })
    .eq('id', indicationId);

  if (updateError) throw updateError;
}

export async function approveEntity(entityId: string) {
  // Update entity status
  const { error: entityError } = await supabase
    .from('authorizing_entities')
    .update({ status: 'approved' })
    .eq('id', entityId);

  if (entityError) throw entityError;
}

export async function rejectEntity(entityId: string) {
  const { error } = await supabase
    .from('authorizing_entities')
    .update({ status: 'rejected' })
    .eq('id', entityId);

  if (error) throw error;
}
