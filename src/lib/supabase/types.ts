/**
 * Supabase database types — manually aligned with the actual schema.
 *
 * To regenerate automatically:
 *   pnpm db:types
 *   (runs: supabase gen types typescript --local > src/lib/supabase/types.ts)
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          google_access_token: string | null;
          google_refresh_token: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          google_access_token?: string | null;
          google_refresh_token?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          google_access_token?: string | null;
          google_refresh_token?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      children: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          dob: string;
          photo_url: string | null;
          allergies: string[];
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          dob: string;
          photo_url?: string | null;
          allergies?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          dob?: string;
          photo_url?: string | null;
          allergies?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          child_id: string | null;
          title: string;
          start_time: string | null;
          end_time: string | null;
          location: string | null;
          source: string | null;
          action_items: Json;
          amount_due: Json | null;
          google_event_id: string | null;
          status: string;
          created_at: string;
          updated_at: string | null;
          reply_draft: string | null;
          confidence: number | null;
          raw_content: string | null;
          file_url: string | null;
          source_label: string | null;
                  deleted_at: string | null;
          date_certainty: string | null;
          original_date_text: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id?: string | null;
          title: string;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
          source?: string | null;
          action_items?: Json;
          amount_due?: Json | null;
          google_event_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          reply_draft?: string | null;
          confidence?: number | null;
          raw_content?: string | null;
          file_url?: string | null;
          source_label?: string | null;
                  deleted_at?: string | null;
          date_certainty?: string | null;
          original_date_text?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string | null;
          title?: string;
          start_time?: string | null;
          end_time?: string | null;
          location?: string | null;
          source?: string | null;
          action_items?: Json;
          amount_due?: Json | null;
          google_event_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string | null;
          reply_draft?: string | null;
          confidence?: number | null;
          raw_content?: string | null;
          file_url?: string | null;
          source_label?: string | null;
                  deleted_at?: string | null;
          date_certainty?: string | null;
          original_date_text?: string | null;
        };
        Relationships: [];
      };
      health_records: {
        Row: {
          id: string;
          user_id: string;
          child_id: string | null;
          visit_date: string | null;
          type: string | null;
          file_url: string | null;
          extracted: Json | null;
          summary: string | null;
          created_at: string;
          updated_at: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          provider: string | null;
                  deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id?: string | null;
          visit_date?: string | null;
          type?: string | null;
          file_url?: string | null;
          extracted?: Json | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          provider?: string | null;
                  deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string | null;
          visit_date?: string | null;
          type?: string | null;
          file_url?: string | null;
          extracted?: Json | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          provider?: string | null;
                  deleted_at?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          child_id: string | null;
          source_url: string | null;
          title: string;
          materials: Json;
          duration_minutes: number | null;
          age_min: number | null;
          age_max: number | null;
          steps: Json;
          scheduled_for: string | null;
          created_at: string;
          updated_at: string | null;
          skills: string[];
          safety_notes: string[];
          messiness: number | null;
          indoor_outdoor: string | null;
          platform: string | null;
          description: string | null;
          difficulty: string | null;
          category: string | null;
                  deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id?: string | null;
          source_url?: string | null;
          title: string;
          materials?: Json;
          duration_minutes?: number | null;
          age_min?: number | null;
          age_max?: number | null;
          steps?: Json;
          scheduled_for?: string | null;
          created_at?: string;
          updated_at?: string | null;
          skills?: string[];
          safety_notes?: string[];
          messiness?: number | null;
          indoor_outdoor?: string | null;
          platform?: string | null;
          description?: string | null;
          difficulty?: string | null;
          category?: string | null;
                  deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string | null;
          source_url?: string | null;
          title?: string;
          materials?: Json;
          duration_minutes?: number | null;
          age_min?: number | null;
          age_max?: number | null;
          steps?: Json;
          scheduled_for?: string | null;
          created_at?: string;
          updated_at?: string | null;
          skills?: string[];
          safety_notes?: string[];
          messiness?: number | null;
          indoor_outdoor?: string | null;
          platform?: string | null;
          description?: string | null;
          difficulty?: string | null;
          category?: string | null;
                  deleted_at?: string | null;
        };
        Relationships: [];
      };
      tips_saved: {
        Row: {
          id: string;
          user_id: string;
          child_id: string | null;
          content: string;
          source: string | null;
          category: string | null;
          created_at: string;
                  deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id?: string | null;
          content: string;
          source?: string | null;
          category?: string | null;
          created_at?: string;
                  deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string | null;
          content?: string;
          source?: string | null;
          category?: string | null;
          created_at?: string;
                  deleted_at?: string | null;
        };
        Relationships: [];
      };
      coach_conversations: {
        Row: {
          id: string;
          user_id: string;
          child_id: string | null;
          created_at: string;
          updated_at: string | null;
                  deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
                  deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string | null;
          created_at?: string;
          updated_at?: string | null;
                  deleted_at?: string | null;
        };
        Relationships: [];
      };
      coach_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          sources: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          sources?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          sources?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      embeddings: {
        Row: {
          id: string;
          content: string;
          source: string | null;
          category: string | null;
          embedding: number[];
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          source?: string | null;
          category?: string | null;
          embedding: number[];
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          source?: string | null;
          category?: string | null;
          embedding?: number[];
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          setting_key: string;
          setting_value: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          setting_key: string;
          setting_value?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          setting_key?: string;
          setting_value?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      sent_emails: {
        Row: {
          id: string;
          user_id: string;
          child_id: string | null;
          event_id: string | null;
          recipient_email: string;
          subject: string;
          email_type: string;
          ics_content: string | null;
          resend_message_id: string | null;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_id?: string | null;
          event_id?: string | null;
          recipient_email: string;
          subject: string;
          email_type?: string;
          ics_content?: string | null;
          resend_message_id?: string | null;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          child_id?: string | null;
          event_id?: string | null;
          recipient_email?: string;
          subject?: string;
          email_type?: string;
          ics_content?: string | null;
          resend_message_id?: string | null;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tips_corpus: {
        Row: {
          id: string;
          content: string;
          source: string;
          source_url: string | null;
          category: string | null;
          age_bucket: string | null;
          embedding: string | null;
          affiliate_url_amazon: string | null;
          affiliate_url_audible: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          source: string;
          source_url?: string | null;
          category?: string | null;
          age_bucket?: string | null;
          embedding?: string | null;
          affiliate_url_amazon?: string | null;
          affiliate_url_audible?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          source?: string;
          source_url?: string | null;
          category?: string | null;
          age_bucket?: string | null;
          embedding?: string | null;
          affiliate_url_amazon?: string | null;
          affiliate_url_audible?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activities_corpus: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          source: string;
          source_url: string | null;
          category: string | null;
          age_min: number | null;
          age_max: number | null;
          duration_minutes: number | null;
          materials: string[] | null;
          steps: string[] | null;
          embedding: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          source: string;
          source_url?: string | null;
          category?: string | null;
          age_min?: number | null;
          age_max?: number | null;
          duration_minutes?: number | null;
          materials?: string[] | null;
          steps?: string[] | null;
          embedding?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          source?: string;
          source_url?: string | null;
          category?: string | null;
          age_min?: number | null;
          age_max?: number | null;
          duration_minutes?: number | null;
          materials?: string[] | null;
          steps?: string[] | null;
          embedding?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      measurements: {
        Row: {
          id: string;
          child_id: string;
          user_id: string;
          date: string;
          type: string;
          value: number;
          unit: string;
          notes: string | null;
          source: string;
          health_record_id: string | null;
          created_at: string;
                  deleted_at: string | null;
        };
        Insert: {
          id?: string;
          child_id: string;
          user_id: string;
          date: string;
          type: string;
          value: number;
          unit?: string;
          notes?: string | null;
          source?: string;
          health_record_id?: string | null;
          created_at?: string;
                  deleted_at?: string | null;
        };
        Update: {
          id?: string;
          child_id?: string;
          user_id?: string;
          date?: string;
          type?: string;
          value?: number;
          unit?: string;
          notes?: string | null;
          source?: string;
          health_record_id?: string | null;
          created_at?: string;
                  deleted_at?: string | null;
        };
        Relationships: [];
      };
      milestones: {
        Row: {
          id: string;
          child_id: string;
          user_id: string;
          category: string;
          title: string;
          description: string | null;
          age_months_expected: number;
          status: string;
          achieved_date: string | null;
          notes: string | null;
          created_at: string;
                  deleted_at: string | null;
        };
        Insert: {
          id?: string;
          child_id: string;
          user_id: string;
          category: string;
          title: string;
          description?: string | null;
          age_months_expected?: number;
          status?: string;
          achieved_date?: string | null;
          notes?: string | null;
          created_at?: string;
                  deleted_at?: string | null;
        };
        Update: {
          id?: string;
          child_id?: string;
          user_id?: string;
          category?: string;
          title?: string;
          description?: string | null;
          age_months_expected?: number;
          status?: string;
          achieved_date?: string | null;
          notes?: string | null;
          created_at?: string;
                  deleted_at?: string | null;
        };
        Relationships: [];
      };
      daily_recommendations: {
        Row: {
          id: string;
          child_id: string | null;
          recommendation_date: string;
          tip_id: string | null;
          activity_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id?: string | null;
          recommendation_date: string;
          tip_id?: string | null;
          activity_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string | null;
          recommendation_date?: string;
          tip_id?: string | null;
          activity_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_corpus: {
        Args: {
          query_embedding: string;
          match_threshold?: number;
          match_count?: number;
          filter_category?: string | null;
          filter_age_bucket?: string | null;
          corpus_table?: string;
        };
        Returns: Array<{
          id: string;
          content: string;
          source: string;
          source_url: string | null;
          category: string | null;
          similarity: number;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
