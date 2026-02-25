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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      businesses: {
        Row: {
          address: string | null
          business_name: string
          category: Database["public"]["Enums"]["business_category"]
          created_at: string
          description: string | null
          district: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          phone: string | null
          shg_group_id: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          business_name: string
          category?: Database["public"]["Enums"]["business_category"]
          created_at?: string
          description?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          shg_group_id?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: Database["public"]["Enums"]["business_category"]
          created_at?: string
          description?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          shg_group_id?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_shg_group_id_fkey"
            columns: ["shg_group_id"]
            isOneToOne: false
            referencedRelation: "shg_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          order_index: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: Database["public"]["Enums"]["course_category"]
          content: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          instructor_name: string | null
          is_published: boolean | null
          language: string
          level: Database["public"]["Enums"]["course_level"]
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["course_category"]
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean | null
          language?: string
          level?: Database["public"]["Enums"]["course_level"]
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["course_category"]
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean | null
          language?: string
          level?: Database["public"]["Enums"]["course_level"]
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      emi_calculations: {
        Row: {
          created_at: string
          id: string
          interest_rate: number
          loan_amount: number
          loan_scheme_id: string | null
          monthly_emi: number
          notes: string | null
          tenure_months: number
          total_interest: number
          total_payment: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_rate: number
          loan_amount: number
          loan_scheme_id?: string | null
          monthly_emi: number
          notes?: string | null
          tenure_months: number
          total_interest: number
          total_payment: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_rate?: number
          loan_amount?: number
          loan_scheme_id?: string | null
          monthly_emi?: number
          notes?: string | null
          tenure_months?: number
          total_interest?: number
          total_payment?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emi_calculations_loan_scheme_id_fkey"
            columns: ["loan_scheme_id"]
            isOneToOne: false
            referencedRelation: "loan_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          business_id: string | null
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          business_id?: string | null
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      government_schemes: {
        Row: {
          applicable_states: string[] | null
          application_process: string | null
          application_url: string | null
          benefits: string | null
          created_at: string
          description: string | null
          documents_required: string | null
          eligibility: string | null
          for_women: boolean | null
          id: string
          max_amount: number | null
          ministry: string | null
          name: string
          scheme_type: string | null
          updated_at: string
        }
        Insert: {
          applicable_states?: string[] | null
          application_process?: string | null
          application_url?: string | null
          benefits?: string | null
          created_at?: string
          description?: string | null
          documents_required?: string | null
          eligibility?: string | null
          for_women?: boolean | null
          id?: string
          max_amount?: number | null
          ministry?: string | null
          name: string
          scheme_type?: string | null
          updated_at?: string
        }
        Update: {
          applicable_states?: string[] | null
          application_process?: string | null
          application_url?: string | null
          benefits?: string | null
          created_at?: string
          description?: string | null
          documents_required?: string | null
          eligibility?: string | null
          for_women?: boolean | null
          id?: string
          max_amount?: number | null
          ministry?: string | null
          name?: string
          scheme_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      income: {
        Row: {
          amount: number
          business_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          business_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          business_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          is_completed: boolean | null
          module_id: string | null
          progress_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          module_id?: string | null
          progress_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          module_id?: string | null
          progress_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_schemes: {
        Row: {
          applicable_business_types: string[] | null
          applicable_states: string[] | null
          application_url: string | null
          created_at: string
          description: string | null
          documents_required: string | null
          eligibility: string | null
          for_shg: boolean | null
          for_women: boolean | null
          id: string
          interest_rate: number
          is_active: boolean | null
          loan_amount_max: number | null
          loan_amount_min: number | null
          ministry: string | null
          name: string
          subsidy_percentage: number | null
          tenure_months_max: number | null
          tenure_months_min: number | null
          updated_at: string
        }
        Insert: {
          applicable_business_types?: string[] | null
          applicable_states?: string[] | null
          application_url?: string | null
          created_at?: string
          description?: string | null
          documents_required?: string | null
          eligibility?: string | null
          for_shg?: boolean | null
          for_women?: boolean | null
          id?: string
          interest_rate: number
          is_active?: boolean | null
          loan_amount_max?: number | null
          loan_amount_min?: number | null
          ministry?: string | null
          name: string
          subsidy_percentage?: number | null
          tenure_months_max?: number | null
          tenure_months_min?: number | null
          updated_at?: string
        }
        Update: {
          applicable_business_types?: string[] | null
          applicable_states?: string[] | null
          application_url?: string | null
          created_at?: string
          description?: string | null
          documents_required?: string | null
          eligibility?: string | null
          for_shg?: boolean | null
          for_women?: boolean | null
          id?: string
          interest_rate?: number
          is_active?: boolean | null
          loan_amount_max?: number | null
          loan_amount_min?: number | null
          ministry?: string | null
          name?: string
          subsidy_percentage?: number | null
          tenure_months_max?: number | null
          tenure_months_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_id: string | null
          buyer_id: string | null
          created_at: string
          id: string
          notes: string | null
          phone: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          buyer_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          buyer_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          stock_quantity: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          stock_quantity?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          stock_quantity?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          full_name: string
          id: string
          phone: string | null
          preferred_language: string | null
          profile_image_url: string | null
          state: string | null
          updated_at: string
          user_id: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          full_name: string
          id?: string
          phone?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      saved_loan_schemes: {
        Row: {
          id: string
          loan_scheme_id: string
          notes: string | null
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          loan_scheme_id: string
          notes?: string | null
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          loan_scheme_id?: string
          notes?: string | null
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_loan_schemes_loan_scheme_id_fkey"
            columns: ["loan_scheme_id"]
            isOneToOne: false
            referencedRelation: "loan_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_applications: {
        Row: {
          applied_at: string
          id: string
          notes: string | null
          scheme_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string
          id?: string
          notes?: string | null
          scheme_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string
          id?: string
          notes?: string | null
          scheme_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheme_applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "government_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      shg_group_income: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          group_id: string
          id: string
          order_id: string | null
          recorded_by: string
          source: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          description?: string | null
          group_id: string
          id?: string
          order_id?: string | null
          recorded_by: string
          source: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          group_id?: string
          id?: string
          order_id?: string | null
          recorded_by?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "shg_group_income_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "shg_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shg_group_income_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shg_group_members: {
        Row: {
          full_name: string
          group_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          phone: string | null
          role: Database["public"]["Enums"]["shg_member_role"]
          user_id: string
        }
        Insert: {
          full_name: string
          group_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["shg_member_role"]
          user_id: string
        }
        Update: {
          full_name?: string
          group_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["shg_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shg_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "shg_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      shg_group_savings: {
        Row: {
          amount: number
          contributor_id: string | null
          contributor_name: string | null
          created_at: string
          date: string
          description: string | null
          group_id: string
          id: string
        }
        Insert: {
          amount: number
          contributor_id?: string | null
          contributor_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          group_id: string
          id?: string
        }
        Update: {
          amount?: number
          contributor_id?: string | null
          contributor_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shg_group_savings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "shg_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      shg_groups: {
        Row: {
          bank_account_number: string | null
          bank_name: string | null
          business_type: Database["public"]["Enums"]["shg_business_type"]
          created_at: string
          description: string | null
          district: string | null
          id: string
          is_active: boolean | null
          leader_user_id: string
          name: string
          state: string | null
          updated_at: string
          village: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_name?: string | null
          business_type?: Database["public"]["Enums"]["shg_business_type"]
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          is_active?: boolean | null
          leader_user_id: string
          name: string
          state?: string | null
          updated_at?: string
          village: string
        }
        Update: {
          bank_account_number?: string | null
          bank_name?: string | null
          business_type?: Database["public"]["Enums"]["shg_business_type"]
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          is_active?: boolean | null
          leader_user_id?: string
          name?: string
          state?: string | null
          updated_at?: string
          village?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "entrepreneur" | "buyer" | "admin"
      business_category:
        | "handicrafts"
        | "textiles"
        | "food_products"
        | "agriculture"
        | "dairy"
        | "beauty"
        | "services"
        | "retail"
        | "other"
      course_category:
        | "business_basics"
        | "digital_skills"
        | "financial_literacy"
        | "marketing"
        | "product_development"
        | "communication"
        | "legal"
        | "other"
      course_level: "beginner" | "intermediate" | "advanced"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      shg_business_type:
        | "tailoring"
        | "dairy"
        | "handicrafts"
        | "agriculture"
        | "food_processing"
        | "textiles"
        | "poultry"
        | "fishery"
        | "beauty_parlor"
        | "retail"
        | "other"
      shg_member_role: "leader" | "treasurer" | "secretary" | "member"
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
      app_role: ["entrepreneur", "buyer", "admin"],
      business_category: [
        "handicrafts",
        "textiles",
        "food_products",
        "agriculture",
        "dairy",
        "beauty",
        "services",
        "retail",
        "other",
      ],
      course_category: [
        "business_basics",
        "digital_skills",
        "financial_literacy",
        "marketing",
        "product_development",
        "communication",
        "legal",
        "other",
      ],
      course_level: ["beginner", "intermediate", "advanced"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      shg_business_type: [
        "tailoring",
        "dairy",
        "handicrafts",
        "agriculture",
        "food_processing",
        "textiles",
        "poultry",
        "fishery",
        "beauty_parlor",
        "retail",
        "other",
      ],
      shg_member_role: ["leader", "treasurer", "secretary", "member"],
    },
  },
} as const
