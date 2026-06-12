import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'donor' | 'entity' | 'beneficiary' | 'admin';
          phone: string | null;
          document_type: 'cpf' | 'cnpj' | null;
          document_number: string | null;
          avatar: string | null;
          instagram: string | null;
          total_donated: number;
          ranking_position: number | null;
          ranking_percentile: string | null;
          favorite_community_id: string | null;
          entity_id: string | null;
          beneficiary_id: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';
          privacy_settings: Json;
          impact_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'donor' | 'entity' | 'beneficiary' | 'admin';
          phone?: string | null;
          document_type?: 'cpf' | 'cnpj' | null;
          document_number?: string | null;
          avatar?: string | null;
          instagram?: string | null;
          total_donated?: number;
          ranking_position?: number | null;
          ranking_percentile?: string | null;
          favorite_community_id?: string | null;
          entity_id?: string | null;
          beneficiary_id?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';
          privacy_settings?: Json;
          impact_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'donor' | 'entity' | 'beneficiary' | 'admin';
          phone?: string | null;
          document_type?: 'cpf' | 'cnpj' | null;
          document_number?: string | null;
          avatar?: string | null;
          instagram?: string | null;
          total_donated?: number;
          ranking_position?: number | null;
          ranking_percentile?: string | null;
          favorite_community_id?: string | null;
          entity_id?: string | null;
          beneficiary_id?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended';
          privacy_settings?: Json;
          impact_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      authorizing_entities: {
        Row: {
          id: string;
          name: string;
          cnpj: string;
          type: 'ONG' | 'igreja' | 'escola' | 'instituto';
          responsible_name: string;
          responsible_role: string | null;
          email: string;
          phone: string;
          region: string;
          address_or_district: string | null;
          website_or_instagram: string | null;
          short_description: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj: string;
          type: 'ONG' | 'igreja' | 'escola' | 'instituto';
          responsible_name: string;
          responsible_role?: string | null;
          email: string;
          phone: string;
          region: string;
          address_or_district?: string | null;
          website_or_instagram?: string | null;
          short_description?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string;
          type?: 'ONG' | 'igreja' | 'escola' | 'instituto';
          responsible_name?: string;
          responsible_role?: string | null;
          email?: string;
          phone?: string;
          region?: string;
          address_or_district?: string | null;
          website_or_instagram?: string | null;
          short_description?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      communities: {
        Row: {
          id: string;
          name: string;
          region: string;
          description: string | null;
          distance: string | null;
          families_total: number;
          families_in_need: number;
          priority: string | null;
          urgency_color: 'error' | 'warning' | 'success' | null;
          image_url: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          region: string;
          description?: string | null;
          distance?: string | null;
          families_total?: number;
          families_in_need?: number;
          priority?: string | null;
          urgency_color?: 'error' | 'warning' | 'success' | null;
          image_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          region?: string;
          description?: string | null;
          distance?: string | null;
          families_total?: number;
          families_in_need?: number;
          priority?: string | null;
          urgency_color?: 'error' | 'warning' | 'success' | null;
          image_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      families: {
        Row: {
          id: string;
          community_id: string | null;
          representative_name: string;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          short_address: string | null;
          description: string | null;
          region: string;
          children_count: number;
          main_need: string | null;
          support_status: 'needs_help' | 'supported' | 'fed' | 'pending' | 'rejected' | 'suspended' | 'approved';
          distance_to_user: string | null;
          priority_level: number;
          latitude: number | null;
          longitude: number | null;
          photo_url: string | null;
          authorizing_entity_id: string | null;
          created_by_entity_id: string | null;
          source_type: 'entity' | 'donor_indication' | null;
          source_entity_name: string | null;
          source_label: string | null;
          original_indication_id: string | null;
          last_fed_at: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id?: string | null;
          representative_name: string;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          short_address?: string | null;
          description?: string | null;
          region: string;
          children_count?: number;
          main_need?: string | null;
          support_status?: 'needs_help' | 'supported' | 'fed' | 'pending' | 'rejected' | 'suspended' | 'approved';
          distance_to_user?: string | null;
          priority_level?: number;
          latitude?: number | null;
          longitude?: number | null;
          photo_url?: string | null;
          authorizing_entity_id?: string | null;
          created_by_entity_id?: string | null;
          source_type?: 'entity' | 'donor_indication' | null;
          source_entity_name?: string | null;
          source_label?: string | null;
          original_indication_id?: string | null;
          last_fed_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string | null;
          representative_name?: string;
          neighborhood?: string | null;
          city?: string | null;
          state?: string | null;
          short_address?: string | null;
          description?: string | null;
          region?: string;
          children_count?: number;
          main_need?: string | null;
          support_status?: 'needs_help' | 'supported' | 'fed' | 'pending' | 'rejected' | 'suspended' | 'approved';
          distance_to_user?: string | null;
          priority_level?: number;
          latitude?: number | null;
          longitude?: number | null;
          photo_url?: string | null;
          authorizing_entity_id?: string | null;
          created_by_entity_id?: string | null;
          source_type?: 'entity' | 'donor_indication' | null;
          source_entity_name?: string | null;
          source_label?: string | null;
          original_indication_id?: string | null;
          last_fed_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          age: number | null;
          school: string | null;
          grade: string | null;
          is_pwd: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          age?: number | null;
          school?: string | null;
          grade?: string | null;
          is_pwd?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          age?: number | null;
          school?: string | null;
          grade?: string | null;
          is_pwd?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      donor_indications: {
        Row: {
          id: string;
          representative_name: string;
          region: string;
          children_count: number;
          observation: string | null;
          contact: string | null;
          indicated_by_user_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'converted';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          representative_name: string;
          region: string;
          children_count?: number;
          observation?: string | null;
          contact?: string | null;
          indicated_by_user_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'converted';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          representative_name?: string;
          region?: string;
          children_count?: number;
          observation?: string | null;
          contact?: string | null;
          indicated_by_user_id?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'converted';
          created_at?: string;
          updated_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          donor_id: string;
          family_id: string;
          community_id: string | null;
          amount: number;
          gift_card_id: string | null;
          message: string | null;
          is_batch: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          family_id: string;
          community_id?: string | null;
          amount: number;
          gift_card_id?: string | null;
          message?: string | null;
          is_batch?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          family_id?: string;
          community_id?: string | null;
          amount?: number;
          gift_card_id?: string | null;
          message?: string | null;
          is_batch?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gift_cards: {
        Row: {
          id: string;
          family_id: string | null;
          donor_id: string | null;
          donation_id: string | null;
          amount: number;
          provider: string;
          code: string;
          label: string | null;
          status: 'generated' | 'delivered' | 'used' | 'redeemed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id?: string | null;
          donor_id?: string | null;
          donation_id?: string | null;
          amount: number;
          provider?: string;
          code: string;
          label?: string | null;
          status?: 'generated' | 'delivered' | 'used' | 'redeemed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          donor_id?: string | null;
          donation_id?: string | null;
          amount?: number;
          provider?: string;
          code?: string;
          label?: string | null;
          status?: 'generated' | 'delivered' | 'used' | 'redeemed';
          created_at?: string;
          updated_at?: string;
        };
      };
      recurrences: {
        Row: {
          id: string;
          user_id: string;
          community_id: string | null;
          family_id: string | null;
          amount: number;
          periodicity: 'daily' | 'weekly' | 'monthly';
          status: 'active' | 'paused';
          next_billing_date: string;
          total_accumulated: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          community_id?: string | null;
          family_id?: string | null;
          amount: number;
          periodicity: 'daily' | 'weekly' | 'monthly';
          status?: 'active' | 'paused';
          next_billing_date: string;
          total_accumulated?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          community_id?: string | null;
          family_id?: string | null;
          amount?: number;
          periodicity?: 'daily' | 'weekly' | 'monthly';
          status?: 'active' | 'paused';
          next_billing_date?: string;
          total_accumulated?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
