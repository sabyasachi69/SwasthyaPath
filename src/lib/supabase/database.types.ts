export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      data_sources: {
        Row: {
          evidence_type: string
          id: string
          owner: string
          public_note: string | null
          retrieved_at: string
          url: string
        }
        Insert: {
          evidence_type: string
          id?: string
          owner: string
          public_note?: string | null
          retrieved_at?: string
          url: string
        }
        Update: {
          evidence_type?: string
          id?: string
          owner?: string
          public_note?: string | null
          retrieved_at?: string
          url?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          address: string
          area_id: string | null
          data_class: string
          id: string
          kind: string
          last_verified_at: string | null
          latitude: number
          location: unknown
          longitude: number
          name_en: string
          name_or: string
          ownership: string
          published_revision_id: string | null
          slug: string
          valid_until: string | null
          verification_status: string
        }
        Insert: {
          address: string
          area_id?: string | null
          data_class?: string
          id?: string
          kind: string
          last_verified_at?: string | null
          latitude: number
          location?: unknown
          longitude: number
          name_en: string
          name_or: string
          ownership?: string
          published_revision_id?: string | null
          slug: string
          valid_until?: string | null
          verification_status?: string
        }
        Update: {
          address?: string
          area_id?: string | null
          data_class?: string
          id?: string
          kind?: string
          last_verified_at?: string | null
          latitude?: number
          location?: unknown
          longitude?: number
          name_en?: string
          name_or?: string
          ownership?: string
          published_revision_id?: string | null
          slug?: string
          valid_until?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_contacts: {
        Row: {
          contact_type: string
          facility_id: string
          id: string
          phone: string
          source_id: string
          valid_until: string
          verified_at: string
        }
        Insert: {
          contact_type: string
          facility_id: string
          id?: string
          phone: string
          source_id: string
          valid_until: string
          verified_at: string
        }
        Update: {
          contact_type?: string
          facility_id?: string
          id?: string
          phone?: string
          source_id?: string
          valid_until?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_contacts_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_contacts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_feedback: {
        Row: {
          category: string
          created_at: string
          facility_id: string
          id: string
          moderation_status: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          facility_id: string
          id?: string
          moderation_status?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          facility_id?: string
          id?: string
          moderation_status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_feedback_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_services: {
        Row: {
          availability: string
          cost_category: string
          facility_id: string
          referral_required: boolean | null
          service_code: string
          source_id: string | null
          valid_until: string | null
          verified_at: string | null
        }
        Insert: {
          availability?: string
          cost_category?: string
          facility_id: string
          referral_required?: boolean | null
          service_code: string
          source_id?: string | null
          valid_until?: string | null
          verified_at?: string | null
        }
        Update: {
          availability?: string
          cost_category?: string
          facility_id?: string
          referral_required?: boolean | null
          service_code?: string
          source_id?: string | null
          valid_until?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_services_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_services_service_code_fkey"
            columns: ["service_code"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "facility_services_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_source_links: {
        Row: {
          facility_id: string
          field_name: string
          source_id: string
        }
        Insert: {
          facility_id: string
          field_name: string
          source_id: string
        }
        Update: {
          facility_id?: string
          field_name?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_source_links_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_source_links_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_hours: {
        Row: {
          closed: boolean
          closes: string | null
          exception_date: string | null
          facility_id: string
          id: string
          opens: string | null
          service_code: string | null
          source_id: string | null
          valid_until: string | null
          verified_at: string | null
          weekday: number | null
        }
        Insert: {
          closed?: boolean
          closes?: string | null
          exception_date?: string | null
          facility_id: string
          id?: string
          opens?: string | null
          service_code?: string | null
          source_id?: string | null
          valid_until?: string | null
          verified_at?: string | null
          weekday?: number | null
        }
        Update: {
          closed?: boolean
          closes?: string | null
          exception_date?: string | null
          facility_id?: string
          id?: string
          opens?: string | null
          service_code?: string | null
          source_id?: string | null
          valid_until?: string | null
          verified_at?: string | null
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_hours_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_hours_service_code_fkey"
            columns: ["service_code"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "operating_hours_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accessibility_preferences: Json
          created_at: string
          preferred_language: string
          user_id: string
        }
        Insert: {
          accessibility_preferences?: Json
          created_at?: string
          preferred_language?: string
          user_id: string
        }
        Update: {
          accessibility_preferences?: Json
          created_at?: string
          preferred_language?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_edges: {
        Row: {
          approved: boolean
          from_facility_id: string
          id: string
          reason_en: string
          reason_or: string
          service_code: string | null
          source_id: string | null
          to_facility_id: string
          valid_until: string
        }
        Insert: {
          approved?: boolean
          from_facility_id: string
          id?: string
          reason_en: string
          reason_or: string
          service_code?: string | null
          source_id?: string | null
          to_facility_id: string
          valid_until: string
        }
        Update: {
          approved?: boolean
          from_facility_id?: string
          id?: string
          reason_en?: string
          reason_or?: string
          service_code?: string | null
          source_id?: string | null
          to_facility_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_edges_from_facility_id_fkey"
            columns: ["from_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_edges_service_code_fkey"
            columns: ["service_code"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "referral_edges_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_edges_to_facility_id_fkey"
            columns: ["to_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          actor_type: string
          created_at: string
          id: string
          referral_id: string
          status: string
          user_id: string
        }
        Insert: {
          actor_type?: string
          created_at?: string
          id?: string
          referral_id: string
          status: string
          user_id?: string
        }
        Update: {
          actor_type?: string
          created_at?: string
          id?: string
          referral_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          acknowledgment: string
          care_plan_id: string
          closed_at: string | null
          created_at: string
          destination_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          acknowledgment?: string
          care_plan_id: string
          closed_at?: string | null
          created_at?: string
          destination_id: string
          id?: string
          status?: string
          user_id?: string
        }
        Update: {
          acknowledgment?: string
          care_plan_id?: string
          closed_at?: string | null
          created_at?: string
          destination_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_care_plan_id_fkey"
            columns: ["care_plan_id"]
            isOneToOne: false
            referencedRelation: "saved_care_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_care_plans: {
        Row: {
          area_id: string | null
          consent_at: string
          created_at: string
          expires_at: string
          facility_id: string
          id: string
          service_code: string
          user_id: string
        }
        Insert: {
          area_id?: string | null
          consent_at?: string
          created_at?: string
          expires_at?: string
          facility_id: string
          id?: string
          service_code: string
          user_id?: string
        }
        Update: {
          area_id?: string | null
          consent_at?: string
          created_at?: string
          expires_at?: string
          facility_id?: string
          id?: string
          service_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_care_plans_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_care_plans_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_care_plans_service_code_fkey"
            columns: ["service_code"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["code"]
          },
        ]
      }
      service_areas: {
        Row: {
          city: string
          id: string
          latitude: number
          locality: string
          longitude: number
          pincode: string
          state: string
        }
        Insert: {
          city?: string
          id?: string
          latitude: number
          locality: string
          longitude: number
          pincode: string
          state?: string
        }
        Update: {
          city?: string
          id?: string
          latitude?: number
          locality?: string
          longitude?: number
          pincode?: string
          state?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          code: string
          name_en: string
          name_or: string
        }
        Insert: {
          code: string
          name_en: string
          name_or: string
        }
        Update: {
          code?: string
          name_en?: string
          name_or?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      active_protocol: { Args: never; Returns: Json }
      add_referral_event: {
        Args: { p_referral: string; p_status: string }
        Returns: undefined
      }
      admin_queue: { Args: never; Returns: Json }
      consume_share: { Args: { p_hash: string }; Returns: Json }
      create_facility_draft: {
        Args: {
          p_evidence: string
          p_reason: string
          p_slug: string
          p_snapshot: Json
        }
        Returns: string
      }
      create_referral: { Args: { p_plan: string }; Returns: string }
      create_share: {
        Args: { p_hash: string; p_referral: string }
        Returns: undefined
      }
      publish_protocol: {
        Args: { p_evidence: Json; p_protocol: string }
        Returns: undefined
      }
      publish_revision: { Args: { p_revision: string }; Returns: undefined }
      restore_publication: {
        Args: { p_publication: string; p_reason: string }
        Returns: undefined
      }
      review_revision: {
        Args: { p_approve: boolean; p_checklist: Json; p_revision: string }
        Returns: undefined
      }
      revoke_share: { Args: { p_referral: string }; Returns: undefined }
      search_facilities: {
        Args: { p_lat: number; p_lng: number; p_service?: string }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "facility_directory"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      submit_protocol: {
        Args: {
          p_expires_at: string
          p_explanations: Json
          p_questions: Json
          p_rules: Json
          p_source_urls: string[]
          p_version: string
        }
        Returns: string
      }
      submit_revision: {
        Args: {
          p_evidence: string
          p_facility: string
          p_reason: string
          p_snapshot: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
