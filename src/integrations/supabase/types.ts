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
        Relationships: []
      }
      content_purchases: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
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
      faqs: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          question: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
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
          price?: number
          purchase_date?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          sessions_remaining?: number
          sessions_total?: number
          updated_at?: string | null
          user_id?: string
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
          order_index: number | null
          quote: string
          role: string | null
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
          order_index?: number | null
          quote: string
          role?: string | null
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
          order_index?: number | null
          quote?: string
          role?: string | null
          updated_at?: string | null
          updated_by?: string | null
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
      user_subscriptions: {
        Row: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      content_access_level: "free" | "basic" | "premium" | "vip"
      content_status: "draft" | "published" | "archived"
      content_type: "course" | "masterclass" | "workshop" | "guide" | "toolkit"
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
      app_role: ["admin", "user"],
      content_access_level: ["free", "basic", "premium", "vip"],
      content_status: ["draft", "published", "archived"],
      content_type: ["course", "masterclass", "workshop", "guide", "toolkit"],
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
