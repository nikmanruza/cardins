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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          image_key: string
          is_active: boolean
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          image_key?: string
          is_active?: boolean
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          image_key?: string
          is_active?: boolean
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_note: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          order_reference: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_note?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          order_reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_note?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          order_reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          allocated_at: string | null
          created_at: string
          delivered_at: string | null
          id: string
          order_item_id: string | null
          product_id: string
          secret_code: string
          status: Database["public"]["Enums"]["inventory_status"]
          updated_at: string
        }
        Insert: {
          allocated_at?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_item_id?: string | null
          product_id: string
          secret_code: string
          status?: Database["public"]["Enums"]["inventory_status"]
          updated_at?: string
        }
        Update: {
          allocated_at?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_item_id?: string | null
          product_id?: string
          secret_code?: string
          status?: Database["public"]["Enums"]["inventory_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          currency: string
          id: string
          image_key: string
          order_id: string
          product_id: string
          product_name: string
          product_slug: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          image_key?: string
          order_id: string
          product_id: string
          product_name: string
          product_slug: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          image_key?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_slug?: string
          quantity?: number
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
          created_at: string
          currency: string
          email: string
          id: string
          paid_at: string | null
          payment_provider: string | null
          payment_reference: string | null
          reference: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          email: string
          id?: string
          paid_at?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          reference: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          email?: string
          id?: string
          paid_at?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          currency: string
          delivery_method: string
          description: string
          game: string | null
          id: string
          image_key: string
          is_bestseller: boolean
          is_featured: boolean
          is_new: boolean
          name: string
          platform: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          rating: number
          redemption_instructions: string | null
          region: string | null
          review_count: number
          sale_price: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string
          slug: string
          stock_status: Database["public"]["Enums"]["stock_status"]
          tags: string[]
          terms: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          currency?: string
          delivery_method?: string
          description?: string
          game?: string | null
          id?: string
          image_key?: string
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          name: string
          platform?: string | null
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          rating?: number
          redemption_instructions?: string | null
          region?: string | null
          review_count?: number
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string
          slug: string
          stock_status?: Database["public"]["Enums"]["stock_status"]
          tags?: string[]
          terms?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          currency?: string
          delivery_method?: string
          description?: string
          game?: string | null
          id?: string
          image_key?: string
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          name?: string
          platform?: string | null
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          rating?: number
          redemption_instructions?: string | null
          region?: string | null
          review_count?: number
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string
          slug?: string
          stock_status?: Database["public"]["Enums"]["stock_status"]
          tags?: string[]
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
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
            foreignKeyName: "wishlist_items_product_id_fkey"
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
      allocate_order_inventory: { Args: { _order_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
      inventory_status: "available" | "allocated" | "delivered" | "void"
      order_status: "pending" | "paid" | "failed" | "refunded" | "cancelled"
      product_type:
        | "GAME_ACCOUNT"
        | "GAME_CARD"
        | "GIFT_CARD"
        | "DIGITAL_PRODUCT"
      stock_status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff", "customer"],
      inventory_status: ["available", "allocated", "delivered", "void"],
      order_status: ["pending", "paid", "failed", "refunded", "cancelled"],
      product_type: [
        "GAME_ACCOUNT",
        "GAME_CARD",
        "GIFT_CARD",
        "DIGITAL_PRODUCT",
      ],
      stock_status: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "PREORDER"],
    },
  },
} as const
