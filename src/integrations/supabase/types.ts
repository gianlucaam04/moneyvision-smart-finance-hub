export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      archived_data: {
        Row: {
          compressed_data: string
          created_at: string | null
          data_type: string
          end_date: string
          id: string
          size_bytes: number
          start_date: string
          user_id: string
        }
        Insert: {
          compressed_data: string
          created_at?: string | null
          data_type: string
          end_date: string
          id?: string
          size_bytes: number
          start_date: string
          user_id: string
        }
        Update: {
          compressed_data?: string
          created_at?: string | null
          data_type?: string
          end_date?: string
          id?: string
          size_bytes?: number
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category_id: string
          created_at: string | null
          id: string
          month: number | null
          period: string
          updated_at: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string | null
          id?: string
          month?: number | null
          period: string
          updated_at?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string | null
          id?: string
          month?: number | null
          period?: string
          updated_at?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      category_rules: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_regex: boolean | null
          pattern: string
          priority: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_regex?: boolean | null
          pattern: string
          priority?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_regex?: boolean | null
          pattern?: string
          priority?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      category_stats: {
        Row: {
          category: string
          confidence: number | null
          count: number | null
          created_at: string | null
          id: string
          merchant_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          confidence?: number | null
          count?: number | null
          created_at?: string | null
          id?: string
          merchant_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          confidence?: number | null
          count?: number | null
          created_at?: string | null
          id?: string
          merchant_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          feedback: Json | null
          id: string
          is_user: boolean
          message: string
          message_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          feedback?: Json | null
          id?: string
          is_user: boolean
          message: string
          message_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          feedback?: Json | null
          id?: string
          is_user?: boolean
          message?: string
          message_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          created_at: string | null
          date: string
          description: string
          id: string
          impact: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description: string
          id?: string
          impact: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          impact?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string | null
          current_price: number
          description: string | null
          expected_return: number | null
          id: string
          last_updated: string | null
          name: string
          notes: string | null
          purchase_date: string
          purchase_price: number
          quantity: number | null
          risk: string | null
          ticker: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          current_price: number
          description?: string | null
          expected_return?: number | null
          id?: string
          last_updated?: string | null
          name: string
          notes?: string | null
          purchase_date: string
          purchase_price: number
          quantity?: number | null
          risk?: string | null
          ticker: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          current_price?: number
          description?: string | null
          expected_return?: number | null
          id?: string
          last_updated?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          quantity?: number | null
          risk?: string | null
          ticker?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_reports: {
        Row: {
          created_at: string | null
          daily_average: number | null
          expenses: number
          id: string
          income: number
          month: number
          report_data: Json
          savings: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          daily_average?: number | null
          expenses?: number
          id?: string
          income?: number
          month: number
          report_data?: Json
          savings?: number
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          daily_average?: number | null
          expenses?: number
          id?: string
          income?: number
          month?: number
          report_data?: Json
          savings?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      receipt_feedback: {
        Row: {
          corrected_text: string
          created_at: string | null
          date: string | null
          id: string
          merchant_name: string | null
          original_text: string
          success_rate: number | null
          total: number | null
          user_id: string
        }
        Insert: {
          corrected_text: string
          created_at?: string | null
          date?: string | null
          id?: string
          merchant_name?: string | null
          original_text: string
          success_rate?: number | null
          total?: number | null
          user_id: string
        }
        Update: {
          corrected_text?: string
          created_at?: string | null
          date?: string | null
          id?: string
          merchant_name?: string | null
          original_text?: string
          success_rate?: number | null
          total?: number | null
          user_id?: string
        }
        Relationships: []
      }
      saving_goals: {
        Row: {
          category_id: number | null
          created_at: string | null
          current_amount: number
          deadline: string | null
          description: string | null
          id: string
          monthly_contribution: number | null
          name: string
          target_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          monthly_contribution?: number | null
          name: string
          target_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          monthly_contribution?: number | null
          name?: string
          target_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transaction_tags: {
        Row: {
          id: string
          tag: string
          transaction_id: string
        }
        Insert: {
          id?: string
          tag: string
          transaction_id: string
        }
        Update: {
          id?: string
          tag?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_tags_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          recurrence_pattern: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_pattern?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_pattern?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          settings: Json | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          settings?: Json | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          settings?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
