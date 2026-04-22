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
      game_participants: {
        Row: {
          game_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          game_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          game_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_participants_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          current_players: number
          date_time: string
          distance: string | null
          host_id: string
          id: string
          intensity: string
          is_live: boolean | null
          location: string
          max_players: number
          skill_level: string
          sport: string
          title: string
          updated_at: string
          venue_id: string | null
          venue_slot_ids: string[] | null
        }
        Insert: {
          created_at?: string
          current_players?: number
          date_time: string
          distance?: string | null
          host_id: string
          id?: string
          intensity?: string
          is_live?: boolean | null
          location: string
          max_players?: number
          skill_level?: string
          sport: string
          title: string
          updated_at?: string
          venue_id?: string | null
          venue_slot_ids?: string[] | null
        }
        Update: {
          created_at?: string
          current_players?: number
          date_time?: string
          distance?: string | null
          host_id?: string
          id?: string
          intensity?: string
          is_live?: boolean | null
          location?: string
          max_players?: number
          skill_level?: string
          sport?: string
          title?: string
          updated_at?: string
          venue_id?: string | null
          venue_slot_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "games_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          mode: string
          order_id: string
          product_id: string | null
          quantity: number
          return_date: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          order_id: string
          product_id?: string | null
          quantity?: number
          return_date?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          return_date?: string | null
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
          cgst: number
          created_at: string
          equipment_cost: number
          friction_id: string | null
          game_id: string | null
          id: string
          payment_method: string | null
          sgst: number
          status: string
          total_amount: number
          updated_at: string
          user_id: string
          venue_cost: number
        }
        Insert: {
          cgst?: number
          created_at?: string
          equipment_cost?: number
          friction_id?: string | null
          game_id?: string | null
          id?: string
          payment_method?: string | null
          sgst?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
          venue_cost?: number
        }
        Update: {
          cgst?: number
          created_at?: string
          equipment_cost?: number
          friction_id?: string | null
          game_id?: string | null
          id?: string
          payment_method?: string | null
          sgst?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          venue_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payment_method: string | null
          payment_type: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          order_id: string
          payment_method?: string | null
          payment_type?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_method?: string | null
          payment_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          can_buy: boolean
          can_rent: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          name: string
          price: number
          rent_price_per_day: number
          sport: string
        }
        Insert: {
          can_buy?: boolean
          can_rent?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name: string
          price?: number
          rent_price_per_day?: number
          sport: string
        }
        Update: {
          can_buy?: boolean
          can_rent?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name?: string
          price?: number
          rent_price_per_day?: number
          sport?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_points: number
          age: number | null
          avatar_url: string | null
          created_at: string
          fitness_level: number | null
          games_created: number
          games_joined: number
          id: string
          location: string | null
          name: string | null
          onboarding_completed: boolean | null
          sport_experiences: Json | null
          sports: string[] | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          activity_points?: number
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          fitness_level?: number | null
          games_created?: number
          games_joined?: number
          id?: string
          location?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          sport_experiences?: Json | null
          sports?: string[] | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          activity_points?: number
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          fitness_level?: number | null
          games_created?: number
          games_joined?: number
          id?: string
          location?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          sport_experiences?: Json | null
          sports?: string[] | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      venue_slot_templates: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          price_per_hour: number
          start_time: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          price_per_hour?: number
          start_time: string
          venue_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          price_per_hour?: number
          start_time?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_slot_templates_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_slots: {
        Row: {
          booked_by_game_id: string | null
          created_at: string
          end_time: string
          id: string
          is_available: boolean
          lock_expires_at: string | null
          locked_by_user_id: string | null
          price_per_hour: number
          slot_date: string
          start_time: string
          status: string
          venue_id: string
        }
        Insert: {
          booked_by_game_id?: string | null
          created_at?: string
          end_time: string
          id?: string
          is_available?: boolean
          lock_expires_at?: string | null
          locked_by_user_id?: string | null
          price_per_hour?: number
          slot_date: string
          start_time: string
          status?: string
          venue_id: string
        }
        Update: {
          booked_by_game_id?: string | null
          created_at?: string
          end_time?: string
          id?: string
          is_available?: boolean
          lock_expires_at?: string | null
          locked_by_user_id?: string | null
          price_per_hour?: number
          slot_date?: string
          start_time?: string
          status?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_slots_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          name: string
          supported_sports: string[]
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          name: string
          supported_sports?: string[]
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          supported_sports?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_venue_slot_booking: {
        Args: { _game_id: string; _slot_ids: string[]; _user_id: string }
        Returns: Json
      }
      generate_slots_from_templates: {
        Args: { _days?: number }
        Returns: number
      }
      lock_venue_slots: {
        Args: { _slot_ids: string[]; _user_id: string }
        Returns: Json
      }
      release_expired_slot_locks: { Args: never; Returns: undefined }
      release_venue_slot_locks: {
        Args: { _slot_ids: string[]; _user_id: string }
        Returns: undefined
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
