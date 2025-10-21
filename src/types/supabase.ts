export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_accounts: {
        Row: {
          id: string
          organization_id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          company_name: string | null
          role: string
          is_active: boolean
          is_demo: boolean
          onboarding_completed: boolean
          trial_ends_at: string | null
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
          is_owner: boolean
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          company_name?: string | null
          role?: string
          is_active?: boolean
          is_demo?: boolean
          onboarding_completed?: boolean
          trial_ends_at?: string | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_owner?: boolean
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          company_name?: string | null
          role?: string
          is_active?: boolean
          is_demo?: boolean
          onboarding_completed?: boolean
          trial_ends_at?: string | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_owner?: boolean
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          subscription_plan: string
          subscription_status: string
          is_demo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          subscription_plan?: string
          subscription_status?: string
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          subscription_plan?: string
          subscription_status?: string
          is_demo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      create_user_and_org: {
        Args: {
          p_email: string
          p_first_name: string
          p_last_name: string
          p_phone: string | null
          p_company_name: string | null
          p_org_name: string
          p_role: string
          p_is_demo: boolean
        }
        Returns: {
          organization_id: string
          user_id: string
        }
      }
    }
    Enums: {
      // Add any enum types here
    }
  }
}
