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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["notification_priority"] | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: []
      }
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          payment_method: string
          processed_by: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method: string
          processed_by?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string
          processed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payouts_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          approved_at: string | null
          commission_amount: number
          created_at: string
          id: string
          order_amount: number
          order_id: string | null
          paid_at: string | null
          referred_user_id: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          approved_at?: string | null
          commission_amount: number
          created_at?: string
          id?: string
          order_amount: number
          order_id?: string | null
          paid_at?: string | null
          referred_user_id?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          approved_at?: string | null
          commission_amount?: number
          created_at?: string
          id?: string
          order_amount?: number
          order_id?: string | null
          paid_at?: string | null
          referred_user_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          commission_rate: number
          created_at: string
          id: string
          payment_details: Json | null
          payment_method: string | null
          status: string
          total_earnings: number
          total_paid: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          commission_rate?: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          status?: string
          total_earnings?: number
          total_paid?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          commission_rate?: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          status?: string
          total_earnings?: number
          total_paid?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_reports: {
        Row: {
          created_at: string | null
          id: string
          report_data: Json
          report_date: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_data?: Json
          report_date: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          report_data?: Json
          report_date?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      aurora_behavioral_patterns: {
        Row: {
          created_at: string
          description: string
          id: string
          pattern_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          pattern_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_checklist_items: {
        Row: {
          checklist_id: string
          completed_at: string | null
          content: string
          created_at: string
          due_date: string | null
          id: string
          is_completed: boolean
          is_recurring: boolean
          order_index: number
        }
        Insert: {
          checklist_id: string
          completed_at?: string | null
          content: string
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          is_recurring?: boolean
          order_index?: number
        }
        Update: {
          checklist_id?: string
          completed_at?: string | null
          content?: string
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          is_recurring?: boolean
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "aurora_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "aurora_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      aurora_checklists: {
        Row: {
          context: string | null
          created_at: string
          id: string
          origin: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          origin?: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          origin?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_commitments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_conversation_memory: {
        Row: {
          action_items: string[] | null
          conversation_id: string | null
          created_at: string | null
          emotional_state: string | null
          id: string
          key_topics: string[] | null
          summary: string
          user_id: string
        }
        Insert: {
          action_items?: string[] | null
          conversation_id?: string | null
          created_at?: string | null
          emotional_state?: string | null
          id?: string
          key_topics?: string[] | null
          summary: string
          user_id: string
        }
        Update: {
          action_items?: string[] | null
          conversation_id?: string | null
          created_at?: string | null
          emotional_state?: string | null
          id?: string
          key_topics?: string[] | null
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aurora_conversation_memory_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      aurora_daily_minimums: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_energy_patterns: {
        Row: {
          created_at: string
          description: string
          id: string
          pattern_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          pattern_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          pattern_type?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_focus_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days: number
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_identity_elements: {
        Row: {
          content: string
          created_at: string
          element_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          element_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          element_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      aurora_life_direction: {
        Row: {
          clarity_score: number | null
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clarity_score?: number | null
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clarity_score?: number | null
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_life_visions: {
        Row: {
          created_at: string
          description: string | null
          focus_areas: string[] | null
          id: string
          timeframe: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          focus_areas?: string[] | null
          id?: string
          timeframe: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          focus_areas?: string[] | null
          id?: string
          timeframe?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_onboarding_progress: {
        Row: {
          direction_clarity: string
          energy_patterns_status: string
          id: string
          identity_understanding: string
          onboarding_complete: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          direction_clarity?: string
          energy_patterns_status?: string
          id?: string
          identity_understanding?: string
          onboarding_complete?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          direction_clarity?: string
          energy_patterns_status?: string
          id?: string
          identity_understanding?: string
          onboarding_complete?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      aurora_reminders: {
        Row: {
          context: string | null
          created_at: string | null
          delivered_at: string | null
          id: string
          is_delivered: boolean | null
          message: string
          reminder_date: string
          source: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          is_delivered?: boolean | null
          message: string
          reminder_date: string
          source?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          is_delivered?: boolean | null
          message?: string
          reminder_date?: string
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_assistant_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_knowledge_base: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          description_en: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          attendees_count: number | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          description_en: string | null
          end_time: string | null
          event_type: string | null
          id: string
          is_published: boolean | null
          max_attendees: number | null
          meeting_url: string | null
          start_time: string
          title: string
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          attendees_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          max_attendees?: number | null
          meeting_url?: string | null
          start_time: string
          title: string
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          attendees_count?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          max_attendees?: number | null
          meeting_url?: string | null
          start_time?: string
          title?: string
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_levels: {
        Row: {
          badge_color: string | null
          badge_icon: string | null
          created_at: string | null
          id: string
          min_points: number
          name: string
          name_en: string | null
          order_index: number | null
          unlocks_content_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string | null
          id?: string
          min_points?: number
          name: string
          name_en?: string | null
          order_index?: number | null
          unlocks_content_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string | null
          id?: string
          min_points?: number
          name?: string
          name_en?: string | null
          order_index?: number | null
          unlocks_content_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          comments_count: number | null
          created_at: string | null
          current_level_id: string | null
          id: string
          is_online: boolean | null
          joined_at: string | null
          last_active_at: string | null
          likes_received: number | null
          posts_count: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number | null
          created_at?: string | null
          current_level_id?: string | null
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          likes_received?: number | null
          posts_count?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          comments_count?: number | null
          created_at?: string | null
          current_level_id?: string | null
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          likes_received?: number | null
          posts_count?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_community_members_level"
            columns: ["current_level_id"]
            isOneToOne: false
            referencedRelation: "community_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      community_point_logs: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          category_id: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      consciousness_leap_applications: {
        Row: {
          admin_notes: string | null
          created_at: string
          current_life_situation: string
          id: string
          lead_id: string
          openness_to_process: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          what_feels_stuck: string
          what_to_understand: string
          why_now: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          current_life_situation: string
          id?: string
          lead_id: string
          openness_to_process: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          what_feels_stuck: string
          what_to_understand: string
          why_now: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          current_life_situation?: string
          id?: string
          lead_id?: string
          openness_to_process?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          what_feels_stuck?: string
          what_to_understand?: string
          why_now?: string
        }
        Relationships: [
          {
            foreignKeyName: "consciousness_leap_applications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "consciousness_leap_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      consciousness_leap_leads: {
        Row: {
          affiliate_code: string | null
          application_token: string
          created_at: string
          email: string
          email_sent_at: string | null
          id: string
          name: string
          status: string
          updated_at: string
          what_resonated: string | null
        }
        Insert: {
          affiliate_code?: string | null
          application_token?: string
          created_at?: string
          email: string
          email_sent_at?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          what_resonated?: string | null
        }
        Update: {
          affiliate_code?: string | null
          application_token?: string
          created_at?: string
          email?: string
          email_sent_at?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          what_resonated?: string | null
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          browser: string | null
          created_at: string | null
          device_type: string | null
          episode_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          product_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          episode_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          episode_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "content_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "content_products"
            referencedColumns: ["id"]
          },
        ]
      }
      content_episodes: {
        Row: {
          completion_count: number | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_preview: boolean | null
          order_index: number | null
          product_id: string
          resources_url: string[] | null
          series_id: string
          thumbnail_url: string | null
          title: string
          transcript_url: string | null
          updated_at: string | null
          video_url: string
          view_count: number | null
        }
        Insert: {
          completion_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean | null
          order_index?: number | null
          product_id: string
          resources_url?: string[] | null
          series_id: string
          thumbnail_url?: string | null
          title: string
          transcript_url?: string | null
          updated_at?: string | null
          video_url: string
          view_count?: number | null
        }
        Update: {
          completion_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean | null
          order_index?: number | null
          product_id?: string
          resources_url?: string[] | null
          series_id?: string
          thumbnail_url?: string | null
          title?: string
          transcript_url?: string | null
          updated_at?: string | null
          video_url?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_episodes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "content_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "content_series"
            referencedColumns: ["id"]
          },
        ]
      }
      content_products: {
        Row: {
          access_level: Database["public"]["Enums"]["content_access_level"]
          average_rating: number | null
          category: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          enrollment_count: number | null
          id: string
          instructor_name: string | null
          is_featured: boolean | null
          learning_objectives: string[] | null
          order_index: number | null
          practitioner_id: string | null
          preview_video_url: string | null
          price: number | null
          requirements: string[] | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
          view_count: number | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["content_access_level"]
          average_rating?: number | null
          category?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          enrollment_count?: number | null
          id?: string
          instructor_name?: string | null
          is_featured?: boolean | null
          learning_objectives?: string[] | null
          order_index?: number | null
          practitioner_id?: string | null
          preview_video_url?: string | null
          price?: number | null
          requirements?: string[] | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["content_access_level"]
          average_rating?: number | null
          category?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          enrollment_count?: number | null
          id?: string
          instructor_name?: string | null
          is_featured?: boolean | null
          learning_objectives?: string[] | null
          order_index?: number | null
          practitioner_id?: string | null
          preview_video_url?: string | null
          price?: number | null
          requirements?: string[] | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_products_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      content_purchases: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
          affiliate_code: string | null
          id: string
          payment_status: string | null
          price_paid: number
          product_id: string
          purchase_date: string | null
          user_id: string
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          affiliate_code?: string | null
          id?: string
          payment_status?: string | null
          price_paid: number
          product_id: string
          purchase_date?: string | null
          user_id: string
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          affiliate_code?: string | null
          id?: string
          payment_status?: string | null
          price_paid?: number
          product_id?: string
          purchase_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "content_products"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          product_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          product_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          product_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "content_products"
            referencedColumns: ["id"]
          },
        ]
      }
      content_series: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          product_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          product_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          product_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_series_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "content_products"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          participant_1: string
          participant_2: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1: string
          participant_2?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_1?: string
          participant_2?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Relationships: []
      }
      conversion_events: {
        Row: {
          conversion_value: number | null
          created_at: string | null
          event_category: string | null
          event_data: Json | null
          event_type: string
          id: string
          page_path: string | null
          session_id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          conversion_value?: number | null
          created_at?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          page_path?: string | null
          session_id: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          conversion_value?: number | null
          created_at?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string | null
          session_id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          completed_episodes: number | null
          enrolled_at: string | null
          id: string
          is_completed: boolean | null
          last_accessed_at: string | null
          product_id: string
          progress_percentage: number | null
          total_episodes: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_episodes?: number | null
          enrolled_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_accessed_at?: string | null
          product_id: string
          progress_percentage?: number | null
          total_episodes?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_episodes?: number | null
          enrolled_at?: string | null
          id?: string
          is_completed?: boolean | null
          last_accessed_at?: string | null
          product_id?: string
          progress_percentage?: number | null
          total_episodes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "content_products"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_forms: {
        Row: {
          access_token: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          settings: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          access_token?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          settings?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          settings?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_protocols: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          ego_state: string | null
          goals: string[] | null
          id: string
          induction: string | null
          is_public: boolean | null
          name: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          ego_state?: string | null
          goals?: string[] | null
          id?: string
          induction?: string | null
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          ego_state?: string | null
          goals?: string[] | null
          id?: string
          induction?: string | null
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_protocols_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_habit_logs: {
        Row: {
          completed_at: string | null
          completed_by: string
          created_at: string
          habit_item_id: string
          id: string
          is_completed: boolean
          notes: string | null
          track_date: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string
          created_at?: string
          habit_item_id: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          track_date?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string
          created_at?: string
          habit_item_id?: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          track_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_habit_logs_habit_item_id_fkey"
            columns: ["habit_item_id"]
            isOneToOne: false
            referencedRelation: "aurora_checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          bounced_at: string | null
          clicked_at: string | null
          created_at: string | null
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          recipient_user_id: string | null
          resend_id: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          recipient_user_id?: string | null
          resend_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          recipient_user_id?: string | null
          resend_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      exit_intent_leads: {
        Row: {
          contacted_at: string | null
          created_at: string
          email: string
          id: string
          is_contacted: boolean | null
          notes: string | null
        }
        Insert: {
          contacted_at?: string | null
          created_at?: string
          email: string
          id?: string
          is_contacted?: boolean | null
          notes?: string | null
        }
        Update: {
          contacted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          is_contacted?: boolean | null
          notes?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          answer_en: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          question: string
          question_en: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          answer: string
          answer_en?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question: string
          question_en?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          answer?: string
          answer_en?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question?: string
          question_en?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      form_analyses: {
        Row: {
          analysis_summary: string
          created_at: string
          form_submission_id: string
          id: string
          patterns: Json | null
          recommendation: string | null
          recommended_product: string | null
          transformation_potential: string | null
        }
        Insert: {
          analysis_summary: string
          created_at?: string
          form_submission_id: string
          id?: string
          patterns?: Json | null
          recommendation?: string | null
          recommended_product?: string | null
          transformation_potential?: string | null
        }
        Update: {
          analysis_summary?: string
          created_at?: string
          form_submission_id?: string
          id?: string
          patterns?: Json | null
          recommendation?: string | null
          recommended_product?: string | null
          transformation_potential?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_analyses_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          created_at: string
          form_id: string
          id: string
          is_required: boolean | null
          label: string
          options: Json | null
          order_index: number | null
          placeholder: string | null
          type: string
          updated_at: string
          validation: Json | null
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          is_required?: boolean | null
          label: string
          options?: Json | null
          order_index?: number | null
          placeholder?: string | null
          type: string
          updated_at?: string
          validation?: Json | null
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          is_required?: boolean | null
          label?: string
          options?: Json | null
          order_index?: number | null
          placeholder?: string | null
          type?: string
          updated_at?: string
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "custom_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          email: string | null
          form_id: string
          id: string
          metadata: Json | null
          responses: Json
          status: string
          submitted_at: string
          user_id: string | null
        }
        Insert: {
          email?: string | null
          form_id: string
          id?: string
          metadata?: Json | null
          responses?: Json
          status?: string
          submitted_at?: string
          user_id?: string | null
        }
        Update: {
          email?: string | null
          form_id?: string
          id?: string
          metadata?: Json | null
          responses?: Json
          status?: string
          submitted_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "custom_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          content_en: string | null
          content_he: string | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          metadata: Json | null
          order_index: number | null
          section_key: string
          subtitle_en: string | null
          subtitle_he: string | null
          title_en: string | null
          title_he: string | null
          updated_at: string | null
        }
        Insert: {
          content_en?: string | null
          content_he?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          section_key: string
          subtitle_en?: string | null
          subtitle_he?: string | null
          title_en?: string | null
          title_he?: string | null
          updated_at?: string | null
        }
        Update: {
          content_en?: string | null
          content_he?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          section_key?: string
          subtitle_en?: string | null
          subtitle_he?: string | null
          title_en?: string | null
          title_he?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hypnosis_audios: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          file_path: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_path: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_path?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hypnosis_script_cache: {
        Row: {
          audio_paths: Json | null
          cache_key: string
          created_at: string | null
          duration_minutes: number
          ego_state: string
          goal: string
          id: string
          language: string
          last_used_at: string | null
          script_data: Json
          use_count: number | null
          user_id: string
        }
        Insert: {
          audio_paths?: Json | null
          cache_key: string
          created_at?: string | null
          duration_minutes: number
          ego_state: string
          goal: string
          id?: string
          language?: string
          last_used_at?: string | null
          script_data: Json
          use_count?: number | null
          user_id: string
        }
        Update: {
          audio_paths?: Json | null
          cache_key?: string
          created_at?: string | null
          duration_minutes?: number
          ego_state?: string
          goal?: string
          id?: string
          language?: string
          last_used_at?: string | null
          script_data?: Json
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hypnosis_script_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hypnosis_sessions: {
        Row: {
          action: string | null
          completed_at: string | null
          created_at: string | null
          duration_seconds: number
          ego_state: string
          experience_gained: number | null
          goal_id: string | null
          id: string
          script_data: Json | null
          user_id: string
        }
        Insert: {
          action?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number
          ego_state?: string
          experience_gained?: number | null
          goal_id?: string | null
          id?: string
          script_data?: Json | null
          user_id: string
        }
        Update: {
          action?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number
          ego_state?: string
          experience_gained?: number | null
          goal_id?: string | null
          id?: string
          script_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hypnosis_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hypnosis_videos: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          file_path: string
          id: string
          thumbnail_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_path: string
          id?: string
          thumbnail_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_path?: string
          id?: string
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          benefits: Json | null
          brand_color: string | null
          created_at: string | null
          custom_css: string | null
          faqs: Json | null
          for_who: Json | null
          form_id: string | null
          hero_badge_text_en: string | null
          hero_badge_text_he: string | null
          hero_heading_en: string | null
          hero_heading_he: string | null
          hero_image_url: string | null
          hero_subheading_en: string | null
          hero_subheading_he: string | null
          hero_video_url: string | null
          id: string
          includes: Json | null
          is_homepage: boolean | null
          is_published: boolean | null
          not_for_who: Json | null
          offer_id: string | null
          pain_points: Json | null
          primary_cta_link: string | null
          primary_cta_text_en: string | null
          primary_cta_text_he: string | null
          primary_cta_type: string | null
          process_steps: Json | null
          sections_config: Json | null
          sections_order: Json | null
          seo_description_en: string | null
          seo_description_he: string | null
          seo_title_en: string | null
          seo_title_he: string | null
          slug: string
          template_type: string
          testimonials: Json | null
          title_en: string | null
          title_he: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          benefits?: Json | null
          brand_color?: string | null
          created_at?: string | null
          custom_css?: string | null
          faqs?: Json | null
          for_who?: Json | null
          form_id?: string | null
          hero_badge_text_en?: string | null
          hero_badge_text_he?: string | null
          hero_heading_en?: string | null
          hero_heading_he?: string | null
          hero_image_url?: string | null
          hero_subheading_en?: string | null
          hero_subheading_he?: string | null
          hero_video_url?: string | null
          id?: string
          includes?: Json | null
          is_homepage?: boolean | null
          is_published?: boolean | null
          not_for_who?: Json | null
          offer_id?: string | null
          pain_points?: Json | null
          primary_cta_link?: string | null
          primary_cta_text_en?: string | null
          primary_cta_text_he?: string | null
          primary_cta_type?: string | null
          process_steps?: Json | null
          sections_config?: Json | null
          sections_order?: Json | null
          seo_description_en?: string | null
          seo_description_he?: string | null
          seo_title_en?: string | null
          seo_title_he?: string | null
          slug: string
          template_type?: string
          testimonials?: Json | null
          title_en?: string | null
          title_he?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          benefits?: Json | null
          brand_color?: string | null
          created_at?: string | null
          custom_css?: string | null
          faqs?: Json | null
          for_who?: Json | null
          form_id?: string | null
          hero_badge_text_en?: string | null
          hero_badge_text_he?: string | null
          hero_heading_en?: string | null
          hero_heading_he?: string | null
          hero_image_url?: string | null
          hero_subheading_en?: string | null
          hero_subheading_he?: string | null
          hero_video_url?: string | null
          id?: string
          includes?: Json | null
          is_homepage?: boolean | null
          is_published?: boolean | null
          not_for_who?: Json | null
          offer_id?: string | null
          pain_points?: Json | null
          primary_cta_link?: string | null
          primary_cta_text_en?: string | null
          primary_cta_text_he?: string | null
          primary_cta_type?: string | null
          process_steps?: Json | null
          sections_config?: Json | null
          sections_order?: Json | null
          seo_description_en?: string | null
          seo_description_he?: string | null
          seo_title_en?: string | null
          seo_title_he?: string | null
          slug?: string
          template_type?: string
          testimonials?: Json | null
          title_en?: string | null
          title_he?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "custom_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      launchpad_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          id: string
          launchpad_complete: boolean | null
          step_1_completed_at: string | null
          step_1_intention: string | null
          step_1_welcome: boolean | null
          step_2_completed_at: string | null
          step_2_first_chat: boolean | null
          step_2_profile: boolean
          step_2_profile_completed_at: string | null
          step_2_profile_data: Json | null
          step_2_summary: string | null
          step_3_completed_at: string | null
          step_3_form_submission_id: string | null
          step_3_introspection: boolean | null
          step_4_completed_at: string | null
          step_4_form_submission_id: string | null
          step_4_life_plan: boolean | null
          step_5_completed_at: string | null
          step_5_focus_areas: boolean | null
          step_5_focus_areas_selected: Json | null
          step_6_actions: Json | null
          step_6_anchor_habit: string | null
          step_6_completed_at: string | null
          step_6_first_week: boolean | null
          step_7_completed_at: string | null
          step_7_dashboard_activated: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          launchpad_complete?: boolean | null
          step_1_completed_at?: string | null
          step_1_intention?: string | null
          step_1_welcome?: boolean | null
          step_2_completed_at?: string | null
          step_2_first_chat?: boolean | null
          step_2_profile?: boolean
          step_2_profile_completed_at?: string | null
          step_2_profile_data?: Json | null
          step_2_summary?: string | null
          step_3_completed_at?: string | null
          step_3_form_submission_id?: string | null
          step_3_introspection?: boolean | null
          step_4_completed_at?: string | null
          step_4_form_submission_id?: string | null
          step_4_life_plan?: boolean | null
          step_5_completed_at?: string | null
          step_5_focus_areas?: boolean | null
          step_5_focus_areas_selected?: Json | null
          step_6_actions?: Json | null
          step_6_anchor_habit?: string | null
          step_6_completed_at?: string | null
          step_6_first_week?: boolean | null
          step_7_completed_at?: string | null
          step_7_dashboard_activated?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          launchpad_complete?: boolean | null
          step_1_completed_at?: string | null
          step_1_intention?: string | null
          step_1_welcome?: boolean | null
          step_2_completed_at?: string | null
          step_2_first_chat?: boolean | null
          step_2_profile?: boolean
          step_2_profile_completed_at?: string | null
          step_2_profile_data?: Json | null
          step_2_summary?: string | null
          step_3_completed_at?: string | null
          step_3_form_submission_id?: string | null
          step_3_introspection?: boolean | null
          step_4_completed_at?: string | null
          step_4_form_submission_id?: string | null
          step_4_life_plan?: boolean | null
          step_5_completed_at?: string | null
          step_5_focus_areas?: boolean | null
          step_5_focus_areas_selected?: Json | null
          step_6_actions?: Json | null
          step_6_anchor_habit?: string | null
          step_6_completed_at?: string | null
          step_6_first_week?: boolean | null
          step_7_completed_at?: string | null
          step_7_dashboard_activated?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launchpad_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      launchpad_summaries: {
        Row: {
          clarity_score: number | null
          consciousness_score: number | null
          generated_at: string | null
          id: string
          summary_data: Json
          transformation_readiness: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clarity_score?: number | null
          consciousness_score?: number | null
          generated_at?: string | null
          id?: string
          summary_data?: Json
          transformation_readiness?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clarity_score?: number | null
          consciousness_score?: number | null
          generated_at?: string | null
          id?: string
          summary_data?: Json
          transformation_readiness?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          affiliate_code: string | null
          contacted_at: string | null
          contacted_by: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          preferred_time: string | null
          source: string
          status: string
        }
        Insert: {
          affiliate_code?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          preferred_time?: string | null
          source?: string
          status?: string
        }
        Update: {
          affiliate_code?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          preferred_time?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      life_plan_milestones: {
        Row: {
          challenge: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          focus_area: string | null
          goal: string | null
          hypnosis_recommendation: string | null
          id: string
          is_completed: boolean | null
          month_number: number
          plan_id: string
          start_date: string | null
          tasks: Json | null
          title: string
          tokens_reward: number | null
          week_number: number
          xp_reward: number | null
        }
        Insert: {
          challenge?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          focus_area?: string | null
          goal?: string | null
          hypnosis_recommendation?: string | null
          id?: string
          is_completed?: boolean | null
          month_number: number
          plan_id: string
          start_date?: string | null
          tasks?: Json | null
          title: string
          tokens_reward?: number | null
          week_number: number
          xp_reward?: number | null
        }
        Update: {
          challenge?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          focus_area?: string | null
          goal?: string | null
          hypnosis_recommendation?: string | null
          id?: string
          is_completed?: boolean | null
          month_number?: number
          plan_id?: string
          start_date?: string | null
          tasks?: Json | null
          title?: string
          tokens_reward?: number | null
          week_number?: number
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "life_plan_milestones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "life_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      life_plans: {
        Row: {
          created_at: string | null
          duration_months: number | null
          end_date: string
          id: string
          plan_data: Json
          progress_percentage: number | null
          start_date: string
          status: string | null
          summary_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_months?: number | null
          end_date?: string
          id?: string
          plan_data?: Json
          progress_percentage?: number | null
          start_date?: string
          status?: string | null
          summary_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_months?: number | null
          end_date?: string
          id?: string
          plan_data?: Json
          progress_percentage?: number | null
          start_date?: string
          status?: string | null
          summary_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_plans_summary_id_fkey"
            columns: ["summary_id"]
            isOneToOne: false
            referencedRelation: "launchpad_summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          action_type: string
          action_value: string
          created_at: string | null
          id: string
          is_visible: boolean | null
          label: string
          label_en: string | null
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          action_type: string
          action_value: string
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          label_en?: string | null
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          action_value?: string
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          label_en?: string | null
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_ai_message: boolean
          is_read: boolean
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_ai_message?: boolean
          is_read?: boolean
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_ai_message?: boolean
          is_read?: boolean
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaigns: {
        Row: {
          content_html_en: string | null
          content_html_he: string
          content_text_en: string | null
          content_text_he: string | null
          created_at: string | null
          created_by: string | null
          id: string
          scheduled_for: string | null
          sent_at: string | null
          stats: Json | null
          status: string | null
          subject_en: string | null
          subject_he: string
          target_audience: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_html_en?: string | null
          content_html_he: string
          content_text_en?: string | null
          content_text_he?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string | null
          subject_en?: string | null
          subject_he: string
          target_audience?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_html_en?: string | null
          content_html_he?: string
          content_text_en?: string | null
          content_text_he?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          scheduled_for?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string | null
          subject_en?: string | null
          subject_he?: string
          target_audience?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          language: string | null
          metadata: Json | null
          name: string | null
          preferences: Json | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          unsubscribe_token: string | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          language?: string | null
          metadata?: Json | null
          name?: string | null
          preferences?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          language?: string | null
          metadata?: Json | null
          name?: string | null
          preferences?: Json | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          badge_text: string | null
          badge_text_en: string | null
          benefits: Json | null
          brand_color: string | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          cta_text_en: string | null
          cta_type: string | null
          description: string | null
          description_en: string | null
          faqs: Json | null
          form_id: string | null
          hero_heading: string | null
          hero_heading_en: string | null
          hero_subheading: string | null
          hero_subheading_en: string | null
          homepage_order: number | null
          id: string
          includes: Json | null
          is_free: boolean | null
          landing_page_enabled: boolean | null
          landing_page_route: string | null
          original_price: number | null
          original_price_usd: number | null
          pain_points: Json | null
          practitioner_id: string | null
          price: number
          price_usd: number | null
          process_steps: Json | null
          product_id: string | null
          seo_description: string | null
          seo_description_en: string | null
          seo_title: string | null
          seo_title_en: string | null
          show_on_homepage: boolean | null
          slug: string
          status: string | null
          subtitle: string | null
          subtitle_en: string | null
          title: string
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          badge_text?: string | null
          badge_text_en?: string | null
          benefits?: Json | null
          brand_color?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          cta_text_en?: string | null
          cta_type?: string | null
          description?: string | null
          description_en?: string | null
          faqs?: Json | null
          form_id?: string | null
          hero_heading?: string | null
          hero_heading_en?: string | null
          hero_subheading?: string | null
          hero_subheading_en?: string | null
          homepage_order?: number | null
          id?: string
          includes?: Json | null
          is_free?: boolean | null
          landing_page_enabled?: boolean | null
          landing_page_route?: string | null
          original_price?: number | null
          original_price_usd?: number | null
          pain_points?: Json | null
          practitioner_id?: string | null
          price?: number
          price_usd?: number | null
          process_steps?: Json | null
          product_id?: string | null
          seo_description?: string | null
          seo_description_en?: string | null
          seo_title?: string | null
          seo_title_en?: string | null
          show_on_homepage?: boolean | null
          slug: string
          status?: string | null
          subtitle?: string | null
          subtitle_en?: string | null
          title: string
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          badge_text?: string | null
          badge_text_en?: string | null
          benefits?: Json | null
          brand_color?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          cta_text_en?: string | null
          cta_type?: string | null
          description?: string | null
          description_en?: string | null
          faqs?: Json | null
          form_id?: string | null
          hero_heading?: string | null
          hero_heading_en?: string | null
          hero_subheading?: string | null
          hero_subheading_en?: string | null
          homepage_order?: number | null
          id?: string
          includes?: Json | null
          is_free?: boolean | null
          landing_page_enabled?: boolean | null
          landing_page_route?: string | null
          original_price?: number | null
          original_price_usd?: number | null
          pain_points?: Json | null
          practitioner_id?: string | null
          price?: number
          price_usd?: number | null
          process_steps?: Json | null
          product_id?: string | null
          seo_description?: string | null
          seo_description_en?: string | null
          seo_title?: string | null
          seo_title_en?: string | null
          show_on_homepage?: boolean | null
          slug?: string
          status?: string | null
          subtitle?: string | null
          subtitle_en?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "custom_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orb_profiles: {
        Row: {
          accent_color: string | null
          computed_from: Json | null
          core_intensity: number
          created_at: string
          geometry_detail: number
          id: string
          layer_count: number
          morph_intensity: number
          morph_speed: number
          particle_count: number
          particle_enabled: boolean
          primary_color: string
          secondary_colors: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          computed_from?: Json | null
          core_intensity?: number
          created_at?: string
          geometry_detail?: number
          id?: string
          layer_count?: number
          morph_intensity?: number
          morph_speed?: number
          particle_count?: number
          particle_enabled?: boolean
          primary_color?: string
          secondary_colors?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          computed_from?: Json | null
          core_intensity?: number
          created_at?: string
          geometry_detail?: number
          id?: string
          layer_count?: number
          morph_intensity?: number
          morph_speed?: number
          particle_count?: number
          particle_enabled?: boolean
          primary_color?: string
          secondary_colors?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          affiliate_code: string | null
          amount: number
          created_at: string | null
          fulfilled_at: string | null
          id: string
          notes: string | null
          order_date: string | null
          payment_approved_at: string | null
          payment_status: string | null
          product_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affiliate_code?: string | null
          amount: number
          created_at?: string | null
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          payment_approved_at?: string | null
          payment_status?: string | null
          product_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affiliate_code?: string | null
          amount?: number
          created_at?: string | null
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          payment_approved_at?: string | null
          payment_status?: string | null
          product_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          entered_at: string | null
          exited_at: string | null
          id: string
          is_bounce: boolean | null
          page_path: string
          page_title: string | null
          referrer_path: string | null
          scroll_depth_percent: number | null
          session_id: string
          time_on_page_seconds: number | null
          user_id: string | null
        }
        Insert: {
          entered_at?: string | null
          exited_at?: string | null
          id?: string
          is_bounce?: boolean | null
          page_path: string
          page_title?: string | null
          referrer_path?: string | null
          scroll_depth_percent?: number | null
          session_id: string
          time_on_page_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          entered_at?: string | null
          exited_at?: string | null
          id?: string
          is_bounce?: boolean | null
          page_path?: string
          page_title?: string | null
          referrer_path?: string | null
          scroll_depth_percent?: number | null
          session_id?: string
          time_on_page_seconds?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      practitioner_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_approved: boolean | null
          practitioner_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          practitioner_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          practitioner_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_reviews_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_services: {
        Row: {
          created_at: string | null
          description: string | null
          description_en: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          order_index: number | null
          practitioner_id: string
          price: number
          price_currency: string | null
          service_type: string
          sessions_count: number | null
          title: string
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          practitioner_id: string
          price: number
          price_currency?: string | null
          service_type: string
          sessions_count?: number | null
          title: string
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          practitioner_id?: string
          price?: number
          price_currency?: string | null
          service_type?: string
          sessions_count?: number | null
          title?: string
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_services_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_specialties: {
        Row: {
          certification_name: string | null
          certification_url: string | null
          created_at: string | null
          id: string
          practitioner_id: string
          specialty: string
          specialty_label: string
          specialty_label_en: string | null
          years_experience: number | null
        }
        Insert: {
          certification_name?: string | null
          certification_url?: string | null
          created_at?: string | null
          id?: string
          practitioner_id: string
          specialty: string
          specialty_label: string
          specialty_label_en?: string | null
          years_experience?: number | null
        }
        Update: {
          certification_name?: string | null
          certification_url?: string | null
          created_at?: string | null
          id?: string
          practitioner_id?: string
          specialty?: string
          specialty_label?: string
          specialty_label_en?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_specialties_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioners: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bio_en: string | null
          calendly_url: string | null
          clients_count: number | null
          commission_rate: number | null
          country: string | null
          created_at: string | null
          display_name: string
          display_name_en: string | null
          hero_image_url: string | null
          id: string
          instagram_url: string | null
          intro_video_url: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          rating: number | null
          reviews_count: number | null
          short_name: string | null
          short_name_en: string | null
          slug: string
          status: string | null
          timezone: string | null
          title: string
          title_en: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bio_en?: string | null
          calendly_url?: string | null
          clients_count?: number | null
          commission_rate?: number | null
          country?: string | null
          created_at?: string | null
          display_name: string
          display_name_en?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          intro_video_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          rating?: number | null
          reviews_count?: number | null
          short_name?: string | null
          short_name_en?: string | null
          slug: string
          status?: string | null
          timezone?: string | null
          title: string
          title_en?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bio_en?: string | null
          calendly_url?: string | null
          clients_count?: number | null
          commission_rate?: number | null
          country?: string | null
          created_at?: string | null
          display_name?: string
          display_name_en?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          intro_video_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          rating?: number | null
          reviews_count?: number | null
          short_name?: string | null
          short_name_en?: string | null
          slug?: string
          status?: string | null
          timezone?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand_color: string | null
          created_at: string | null
          description: string | null
          description_en: string | null
          id: string
          practitioner_id: string | null
          price: number
          price_usd: number | null
          product_type: string
          settings: Json | null
          slug: string
          status: string | null
          title: string
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          brand_color?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          practitioner_id?: string | null
          price: number
          price_usd?: number | null
          product_type: string
          settings?: Json | null
          slug: string
          status?: string | null
          title: string
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_color?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          practitioner_id?: string | null
          price?: number
          price_usd?: number | null
          product_type?: string
          settings?: Json | null
          slug?: string
          status?: string | null
          title?: string
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_ego_state: string | null
          aurora_preferences: Json | null
          bio: string | null
          created_at: string | null
          ego_state_usage: Json | null
          experience: number | null
          full_name: string | null
          id: string
          last_session_date: string | null
          level: number | null
          preferred_language: string | null
          session_streak: number | null
          tokens: number | null
          updated_at: string | null
        }
        Insert: {
          active_ego_state?: string | null
          aurora_preferences?: Json | null
          bio?: string | null
          created_at?: string | null
          ego_state_usage?: Json | null
          experience?: number | null
          full_name?: string | null
          id: string
          last_session_date?: string | null
          level?: number | null
          preferred_language?: string | null
          session_streak?: number | null
          tokens?: number | null
          updated_at?: string | null
        }
        Update: {
          active_ego_state?: string | null
          aurora_preferences?: Json | null
          bio?: string | null
          created_at?: string | null
          ego_state_usage?: Json | null
          experience?: number | null
          full_name?: string | null
          id?: string
          last_session_date?: string | null
          level?: number | null
          preferred_language?: string | null
          session_streak?: number | null
          tokens?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          booking_confirmed_at: string | null
          booking_link: string | null
          booking_notes: string | null
          booking_status: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          notes: string | null
          package_type: string
          payment_completed_at: string | null
          payment_method: string | null
          payment_status: string | null
          practitioner_id: string | null
          price: number
          purchase_date: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          sessions_remaining: number
          sessions_total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_confirmed_at?: string | null
          booking_link?: string | null
          booking_notes?: string | null
          booking_status?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          package_type: string
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          practitioner_id?: string | null
          price: number
          purchase_date?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          sessions_remaining: number
          sessions_total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_confirmed_at?: string | null
          booking_link?: string | null
          booking_notes?: string | null
          booking_status?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          package_type?: string
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          practitioner_id?: string | null
          price?: number
          purchase_date?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          sessions_remaining?: number
          sessions_total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          device_name: string | null
          device_type: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          device_name?: string | null
          device_type?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_completions: {
        Row: {
          analysis: Json | null
          blindspots: Json | null
          completed_at: string | null
          created_at: string | null
          form_submission_id: string | null
          goals_suggested: Json | null
          habits_suggested: Json | null
          id: string
          key_insights: Json | null
          life_model_updates_applied: boolean | null
          next_actions: Json | null
          questionnaire_type: string
          summary: string | null
          tags: Json | null
          tokens_awarded: number | null
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          analysis?: Json | null
          blindspots?: Json | null
          completed_at?: string | null
          created_at?: string | null
          form_submission_id?: string | null
          goals_suggested?: Json | null
          habits_suggested?: Json | null
          id?: string
          key_insights?: Json | null
          life_model_updates_applied?: boolean | null
          next_actions?: Json | null
          questionnaire_type: string
          summary?: string | null
          tags?: Json | null
          tokens_awarded?: number | null
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          analysis?: Json | null
          blindspots?: Json | null
          completed_at?: string | null
          created_at?: string | null
          form_submission_id?: string | null
          goals_suggested?: Json | null
          habits_suggested?: Json | null
          id?: string
          key_insights?: Json | null
          life_model_updates_applied?: boolean | null
          next_actions?: Json | null
          questionnaire_type?: string
          summary?: string | null
          tags?: Json | null
          tokens_awarded?: number | null
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_completions_form_submission_id_fkey"
            columns: ["form_submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          description_en: string | null
          id: string
          is_enabled: boolean | null
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          is_enabled?: boolean | null
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          is_enabled?: boolean | null
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          access_level: Database["public"]["Enums"]["content_access_level"]
          can_download_resources: boolean | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          max_downloads_per_month: number | null
          name: string
          order_index: number | null
          price_monthly: number
          price_quarterly: number | null
          price_yearly: number | null
          priority_support: boolean | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          access_level: Database["public"]["Enums"]["content_access_level"]
          can_download_resources?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          max_downloads_per_month?: number | null
          name: string
          order_index?: number | null
          price_monthly: number
          price_quarterly?: number | null
          price_yearly?: number | null
          priority_support?: boolean | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["content_access_level"]
          can_download_resources?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          max_downloads_per_month?: number | null
          name?: string
          order_index?: number | null
          price_monthly?: number
          price_quarterly?: number | null
          price_yearly?: number | null
          priority_support?: boolean | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          initials: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          name_en: string | null
          order_index: number | null
          quote: string
          quote_en: string | null
          role: string | null
          role_en: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          initials?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          name_en?: string | null
          order_index?: number | null
          quote: string
          quote_en?: string | null
          role?: string | null
          role_en?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          initials?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          name_en?: string | null
          order_index?: number | null
          quote?: string
          quote_en?: string | null
          role?: string | null
          role_en?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      theme_presets: {
        Row: {
          colors: Json
          created_at: string | null
          description: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          order_index: number | null
          updated_at: string | null
        }
        Insert: {
          colors: Json
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          order_index?: number | null
          updated_at?: string | null
        }
        Update: {
          colors?: Json
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          order_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          metadata: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          metadata?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          metadata?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_audio_access: {
        Row: {
          access_token: string
          audio_id: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          notes: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string
          audio_id: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          audio_id?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_audio_access_audio_id_fkey"
            columns: ["audio_id"]
            isOneToOne: false
            referencedRelation: "hypnosis_audios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feature_unlocks: {
        Row: {
          feature_key: string
          id: string
          unlock_reason: string | null
          unlock_source: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          feature_key: string
          id?: string
          unlock_reason?: string | null
          unlock_source?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          feature_key?: string
          id?: string
          unlock_reason?: string | null
          unlock_source?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          episode_id: string
          id: string
          last_position_seconds: number | null
          last_watched_at: string | null
          product_id: string
          user_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          episode_id: string
          id?: string
          last_position_seconds?: number | null
          last_watched_at?: string | null
          product_id: string
          user_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          episode_id?: string
          id?: string
          last_position_seconds?: number | null
          last_watched_at?: string | null
          product_id?: string
          user_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "content_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "content_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sensitive_data: {
        Row: {
          created_at: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          affiliate_code: string | null
          billing_cycle: string
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          end_date: string | null
          id: string
          next_billing_date: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          tier_id: string
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affiliate_code?: string | null
          billing_cycle?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier_id: string
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affiliate_code?: string | null
          billing_cycle?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          next_billing_date?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tier_id?: string
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_video_access: {
        Row: {
          access_token: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          notes: string | null
          user_id: string | null
          video_id: string
        }
        Insert: {
          access_token?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          user_id?: string | null
          video_id: string
        }
        Update: {
          access_token?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          user_id?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_video_access_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "hypnosis_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_sessions: {
        Row: {
          browser: string | null
          country: string | null
          device_type: string | null
          first_seen: string | null
          id: string
          is_returning: boolean | null
          landing_page: string | null
          language: string | null
          last_seen: string | null
          os: string | null
          page_views: number | null
          referrer: string | null
          screen_size: string | null
          session_id: string
          total_time_seconds: number | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          device_type?: string | null
          first_seen?: string | null
          id?: string
          is_returning?: boolean | null
          landing_page?: string | null
          language?: string | null
          last_seen?: string | null
          os?: string | null
          page_views?: number | null
          referrer?: string | null
          screen_size?: string | null
          session_id: string
          total_time_seconds?: number | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          device_type?: string | null
          first_seen?: string | null
          id?: string
          is_returning?: boolean | null
          landing_page?: string | null
          language?: string | null
          last_seen?: string | null
          os?: string | null
          page_views?: number | null
          referrer?: string | null
          screen_size?: string | null
          session_id?: string
          total_time_seconds?: number | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          reason: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          reason?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          reason?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      weekly_user_stats: {
        Row: {
          aurora_chats: number | null
          hypnosis_sessions: number | null
          insights_gained: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      aurora_award_xp: {
        Args: { p_amount: number; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      award_unified_xp: {
        Args: {
          p_amount: number
          p_reason?: string
          p_source: string
          p_user_id: string
        }
        Returns: undefined
      }
      check_expiring_access: { Args: never; Returns: undefined }
      check_streak_bonus: { Args: { p_user_id: string }; Returns: number }
      complete_launchpad_step: {
        Args: { p_data?: Json; p_step: number; p_user_id: string }
        Returns: Json
      }
      create_admin_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_metadata?: Json
          p_priority: Database["public"]["Enums"]["notification_priority"]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: undefined
      }
      create_user_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      get_or_create_ai_conversation: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_tier: { Args: { p_user_id: string }; Returns: string }
      has_permission: {
        Args: { _permission_key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "practitioner" | "affiliate"
      content_access_level: "free" | "basic" | "premium" | "vip"
      content_status: "draft" | "published" | "archived"
      content_type: "course" | "masterclass" | "workshop" | "guide" | "toolkit"
      conversation_type: "direct" | "ai"
      notification_priority: "low" | "medium" | "high" | "urgent"
      notification_type:
        | "new_user"
        | "new_purchase"
        | "new_subscription"
        | "subscription_cancelled"
        | "new_enrollment"
        | "course_completed"
        | "new_review"
        | "high_value_purchase"
        | "payment_failed"
        | "content_uploaded"
        | "user_milestone"
        | "expiring_access"
        | "new_testimonial"
        | "new_faq_needed"
        | "system_alert"
        | "new_form_submission"
        | "new_consciousness_leap_application"
        | "new_personal_hypnosis_order"
        | "new_lead"
        | "new_affiliate"
        | "affiliate_referral"
      subscription_status:
        | "active"
        | "cancelled"
        | "expired"
        | "trial"
        | "paused"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "practitioner", "affiliate"],
      content_access_level: ["free", "basic", "premium", "vip"],
      content_status: ["draft", "published", "archived"],
      content_type: ["course", "masterclass", "workshop", "guide", "toolkit"],
      conversation_type: ["direct", "ai"],
      notification_priority: ["low", "medium", "high", "urgent"],
      notification_type: [
        "new_user",
        "new_purchase",
        "new_subscription",
        "subscription_cancelled",
        "new_enrollment",
        "course_completed",
        "new_review",
        "high_value_purchase",
        "payment_failed",
        "content_uploaded",
        "user_milestone",
        "expiring_access",
        "new_testimonial",
        "new_faq_needed",
        "system_alert",
        "new_form_submission",
        "new_consciousness_leap_application",
        "new_personal_hypnosis_order",
        "new_lead",
        "new_affiliate",
        "affiliate_referral",
      ],
      subscription_status: [
        "active",
        "cancelled",
        "expired",
        "trial",
        "paused",
      ],
    },
  },
} as const
