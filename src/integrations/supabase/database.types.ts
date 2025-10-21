export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          auth_user_id: string;
          email: string;
          role: string;
          permissions: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          email: string;
          role?: string;
          permissions?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          email?: string;
          role?: string;
          permissions?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_accounts: {
        Row: {
          id: string;
          auth_user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          company_name: string | null;
          role: string;
          is_active: boolean;
          is_demo: boolean;
          onboarding_completed: boolean;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          company_name?: string | null;
          role?: string;
          is_active?: boolean;
          is_demo?: boolean;
          onboarding_completed?: boolean;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          company_name?: string | null;
          role?: string;
          is_active?: boolean;
          is_demo?: boolean;
          onboarding_completed?: boolean;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      unit_utilities: {
        Row: {
          id: string;
          property_id: string;
          unit_id: string;
          utility_type: 'water' | 'electricity';
          current_reading: number;
          previous_reading: number | null;
          reading_date: string;
          month: string;
          year: number;
          rate: number | null;
          amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          unit_id: string;
          utility_type: 'water' | 'electricity';
          current_reading: number;
          previous_reading?: number | null;
          reading_date: string;
          month: string;
          year: number;
          rate?: number | null;
          amount: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          unit_id?: string;
          utility_type?: 'water' | 'electricity';
          current_reading?: number;
          previous_reading?: number | null;
          reading_date?: string;
          month?: string;
          year?: number;
          rate?: number | null;
          amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "unit_utilities_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_utilities_unit_id_fkey"
            columns: ["unit_id"]
            referencedRelation: "units"
            referencedColumns: ["id"]
          }
        ];
      };
      properties: {
        Row: {
          id: string;
          name: string;
          address: string;
          property_type: string;
          total_units: number;
          caretaker_name: string | null;
          water_rate: number | null;
          electricity_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          property_type?: string;
          total_units?: number;
          caretaker_name?: string | null;
          water_rate?: number | null;
          electricity_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          property_type?: string;
          total_units?: number;
          caretaker_name?: string | null;
          water_rate?: number | null;
          electricity_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      units: {
        Row: {
          id: string;
          property_id: string;
          unit_number: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          unit_number: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          unit_number?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          }
        ];
      };
      // ... other table definitions as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_user_and_org: {
        Args: {
          p_email: string;
          p_first_name: string;
          p_last_name: string;
          p_phone: string | null;
          p_company_name: string | null;
          p_org_name: string;
          p_role: string;
          p_is_demo: boolean;
        };
        Returns: {
          organization_id: string;
          user_id: string;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
