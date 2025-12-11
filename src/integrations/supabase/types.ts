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
      credit_balances: {
        Row: {
          created_at: string
          current_credits: number
          id: string
          last_daily_refill: string | null
          last_monthly_reset: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_credits?: number
          id?: string
          last_daily_refill?: string | null
          last_monthly_reset?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_credits?: number
          id?: string
          last_daily_refill?: string | null
          last_monthly_reset?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_logs: {
        Row: {
          action_type: string
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      custom_domains: {
        Row: {
          created_at: string
          deactivation_reason: string | null
          deployment_id: string
          dns_configured: boolean | null
          domain: string
          id: string
          is_active: boolean | null
          ssl_provisioned: boolean | null
          updated_at: string
          user_id: string
          verification_status: string
          verification_token: string | null
        }
        Insert: {
          created_at?: string
          deactivation_reason?: string | null
          deployment_id: string
          dns_configured?: boolean | null
          domain: string
          id?: string
          is_active?: boolean | null
          ssl_provisioned?: boolean | null
          updated_at?: string
          user_id: string
          verification_status?: string
          verification_token?: string | null
        }
        Update: {
          created_at?: string
          deactivation_reason?: string | null
          deployment_id?: string
          dns_configured?: boolean | null
          domain?: string
          id?: string
          is_active?: boolean | null
          ssl_provisioned?: boolean | null
          updated_at?: string
          user_id?: string
          verification_status?: string
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_logs: {
        Row: {
          created_at: string
          deployment_id: string
          id: string
          level: string
          message: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          deployment_id: string
          id?: string
          level?: string
          message: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          deployment_id?: string
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_logs_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
        ]
      }
      deployments: {
        Row: {
          created_at: string
          custom_domain: string | null
          deployment_type: string
          deployment_url: string | null
          error_message: string | null
          external_deployment_id: string | null
          hosting_provider: string | null
          id: string
          last_deployed_at: string | null
          project_id: string
          ssl_status: string | null
          status: string
          subdomain: string | null
          updated_at: string
          user_id: string
          vercel_project_name: string | null
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          deployment_type?: string
          deployment_url?: string | null
          error_message?: string | null
          external_deployment_id?: string | null
          hosting_provider?: string | null
          id?: string
          last_deployed_at?: string | null
          project_id: string
          ssl_status?: string | null
          status?: string
          subdomain?: string | null
          updated_at?: string
          user_id: string
          vercel_project_name?: string | null
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          deployment_type?: string
          deployment_url?: string | null
          error_message?: string | null
          external_deployment_id?: string | null
          hosting_provider?: string | null
          id?: string
          last_deployed_at?: string | null
          project_id?: string
          ssl_status?: string | null
          status?: string
          subdomain?: string | null
          updated_at?: string
          user_id?: string
          vercel_project_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_sites: {
        Row: {
          business_description: string
          business_type: string | null
          created_at: string
          generated_html: string
          id: string
          site_name: string | null
        }
        Insert: {
          business_description: string
          business_type?: string | null
          created_at?: string
          generated_html: string
          id?: string
          site_name?: string | null
        }
        Update: {
          business_description?: string
          business_type?: string | null
          created_at?: string
          generated_html?: string
          id?: string
          site_name?: string | null
        }
        Relationships: []
      }
      plan_limits: {
        Row: {
          badge_removable: boolean
          created_at: string
          custom_domain_allowed: boolean
          daily_credits: number
          id: string
          max_credit_pool: number
          max_projects: number
          monthly_credits: number
          name: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          price_monthly: number
          priority_level: number
        }
        Insert: {
          badge_removable?: boolean
          created_at?: string
          custom_domain_allowed?: boolean
          daily_credits?: number
          id?: string
          max_credit_pool?: number
          max_projects?: number
          monthly_credits?: number
          name: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          price_monthly?: number
          priority_level?: number
        }
        Update: {
          badge_removable?: boolean
          created_at?: string
          custom_domain_allowed?: boolean
          daily_credits?: number
          id?: string
          max_credit_pool?: number
          max_projects?: number
          monthly_credits?: number
          name?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price_monthly?: number
          priority_level?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          plan: string
          token_balance: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          plan?: string
          token_balance?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          plan?: string
          token_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_shares: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          permission: string
          project_id: string
          shared_with_email: string
          shared_with_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          permission?: string
          project_id: string
          shared_with_email: string
          shared_with_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          permission?: string
          project_id?: string
          shared_with_email?: string
          shared_with_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_shares_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_versions: {
        Row: {
          created_at: string
          html_content: string
          id: string
          project_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          project_id: string
          version_number?: number
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          project_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          business_type: string | null
          created_at: string
          current_html: string | null
          description: string | null
          id: string
          name: string
          site_structure: Json | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          current_html?: string | null
          description?: string | null
          id?: string
          name?: string
          site_structure?: Json | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: string | null
          created_at?: string
          current_html?: string | null
          description?: string | null
          id?: string
          name?: string
          site_structure?: Json | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          credits_awarded: number | null
          has_pro_subscription: boolean | null
          has_published_site: boolean | null
          id: string
          qualified_at: string | null
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string
          rewarded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_awarded?: number | null
          has_pro_subscription?: boolean | null
          has_published_site?: boolean | null
          id?: string
          qualified_at?: string | null
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id: string
          rewarded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_awarded?: number | null
          has_pro_subscription?: boolean | null
          has_published_site?: boolean | null
          id?: string
          qualified_at?: string | null
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          rewarded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_use_custom_domain: { Args: { user_uuid: string }; Returns: boolean }
      check_and_reward_referral: {
        Args: { referred_uuid: string }
        Returns: boolean
      }
      check_project_limit: {
        Args: { user_uuid: string }
        Returns: {
          can_create: boolean
          current_count: number
          max_allowed: number
        }[]
      }
      consume_credits: {
        Args: {
          action_description?: string
          tokens_used: number
          user_uuid: string
        }
        Returns: {
          credits_consumed: number
          error_message: string
          remaining_credits: number
          success: boolean
        }[]
      }
      daily_credit_refill: {
        Args: { user_uuid: string }
        Returns: {
          credits_added: number
          new_balance: number
        }[]
      }
      deactivate_expired_domains: { Args: never; Returns: undefined }
      deduct_tokens: {
        Args: { amount: number; user_uuid: string }
        Returns: boolean
      }
      generate_subdomain: {
        Args: { project_id: string; project_name: string }
        Returns: string
      }
      get_or_create_referral_code: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_plan_limits: {
        Args: { user_uuid: string }
        Returns: {
          badge_removable: boolean
          custom_domain_allowed: boolean
          daily_credits: number
          max_credit_pool: number
          max_projects: number
          monthly_credits: number
          name: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          priority_level: number
        }[]
      }
      handle_subscription_downgrade: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      link_referral: {
        Args: {
          new_user_email: string
          new_user_uuid: string
          referral_code_param: string
        }
        Returns: boolean
      }
    }
    Enums: {
      subscription_plan:
        | "free"
        | "pro"
        | "pro_plus"
        | "pro_max"
        | "pro_ultra"
        | "pro_extreme"
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
      subscription_plan: [
        "free",
        "pro",
        "pro_plus",
        "pro_max",
        "pro_ultra",
        "pro_extreme",
      ],
    },
  },
} as const
