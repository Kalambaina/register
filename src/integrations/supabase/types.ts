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
      categories: {
        Row: {
          created_at: string
          description: string | null
          fee: number
          id: string
          max_participants: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          max_participants: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          max_participants?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_tickets: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          qr_code: string | null
          registration_id: string
          role: string
          ticket_number: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          qr_code?: string | null
          registration_id: string
          role: string
          ticket_number?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          qr_code?: string | null
          registration_id?: string
          role?: string
          ticket_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_tickets_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_registrations: {
        Row: {
          admin_verified: boolean
          amount: number
          comments: string | null
          created_at: string
          email: string | null
          full_name: string
          gender: string
          id: string
          lga: string
          payment_status: string
          phone_number: string
          state: string
          tracking_number: string
          updated_at: string
        }
        Insert: {
          admin_verified?: boolean
          amount?: number
          comments?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          gender: string
          id?: string
          lga: string
          payment_status?: string
          phone_number: string
          state: string
          tracking_number: string
          updated_at?: string
        }
        Update: {
          admin_verified?: boolean
          amount?: number
          comments?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          gender?: string
          id?: string
          lga?: string
          payment_status?: string
          phone_number?: string
          state?: string
          tracking_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      individual_tickets: {
        Row: {
          checked_in: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          id: string
          pdf_url: string | null
          qr_code: string
          registration_id: string
          status: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          qr_code: string
          registration_id: string
          status?: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          qr_code?: string
          registration_id?: string
          status?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_tickets_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "individual_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          category_id: string | null
          class: string
          created_at: string
          id: string
          name: string
          registration_id: string
        }
        Insert: {
          category_id?: string | null
          class: string
          created_at?: string
          id?: string
          name: string
          registration_id: string
        }
        Update: {
          category_id?: string | null
          class?: string
          created_at?: string
          id?: string
          name?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          gateway_reference: string | null
          gateway_response: Json | null
          id: string
          payment_gateway: string
          payment_method: string | null
          payment_reference: string
          payment_status: string
          registration_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          payment_gateway: string
          payment_method?: string | null
          payment_reference: string
          payment_status?: string
          registration_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          payment_gateway?: string
          payment_method?: string | null
          payment_reference?: string
          payment_status?: string
          registration_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          registration_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          registration_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_categories_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          comments: string | null
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          payment_method: string | null
          payment_status: string
          school_name: string
          status: string
          total_amount: number | null
          tracking_number: string
          updated_at: string
        }
        Insert: {
          comments?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          school_name: string
          status?: string
          total_amount?: number | null
          tracking_number: string
          updated_at?: string
        }
        Update: {
          comments?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          school_name?: string
          status?: string
          total_amount?: number | null
          tracking_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          id: string
          pdf_url: string | null
          qr_code: string
          registration_id: string
          status: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pdf_url?: string | null
          qr_code: string
          registration_id: string
          status?: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pdf_url?: string | null
          qr_code?: string
          registration_id?: string
          status?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_registration_fee:
        | { Args: { participant_count: number }; Returns: number }
        | { Args: { category_ids: string[] }; Returns: number }
        | { Args: { categories: string[] }; Returns: number }
      generate_ticket_number: { Args: never; Returns: string }
      generate_tracking_number: { Args: never; Returns: string }
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
    Enums: {},
  },
} as const
