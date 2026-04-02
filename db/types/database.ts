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
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      favorite_songs: {
        Row: {
          created_at: string | null
          folder_id: string | null
          id: string
          member_no: string
          song_id: string | null
        }
        Insert: {
          created_at?: string | null
          folder_id?: string | null
          id?: string
          member_no: string
          song_id?: string | null
        }
        Update: {
          created_at?: string | null
          folder_id?: string | null
          id?: string
          member_no?: string
          song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorite_songs_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "karaoke_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      flo_reels: {
        Row: {
          created_at: string | null
          id: string
          likes: number | null
          song_id: string
          tags: string[] | null
          thumbnail_url: string | null
          uploader_id: string
          video_title: string
          video_url: string | null
          views: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          likes?: number | null
          song_id: string
          tags?: string[] | null
          thumbnail_url?: string | null
          uploader_id: string
          video_title: string
          video_url?: string | null
          views?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          likes?: number | null
          song_id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          uploader_id?: string
          video_title?: string
          video_url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flo_reels_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "karaoke_songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flo_reels_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["member_no"]
          },
        ]
      }
      folder_members: {
        Row: {
          folder_id: string | null
          id: string
          joined_at: string | null
          member_no: string
          role: string
        }
        Insert: {
          folder_id?: string | null
          id?: string
          joined_at?: string | null
          member_no: string
          role?: string
        }
        Update: {
          folder_id?: string | null
          id?: string
          joined_at?: string | null
          member_no?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_members_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_members_member_no_fkey"
            columns: ["member_no"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["member_no"]
          },
        ]
      }
      folders: {
        Row: {
          cover_url: string | null
          created_at: string | null
          id: string
          invitation_message: string | null
          is_shared: boolean | null
          member_no: string
          name: string
          share_key: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          id?: string
          invitation_message?: string | null
          is_shared?: boolean | null
          member_no: string
          name: string
          share_key?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          id?: string
          invitation_message?: string | null
          is_shared?: boolean | null
          member_no?: string
          name?: string
          share_key?: string | null
        }
        Relationships: []
      }
      karaoke_songs: {
        Row: {
          artist: string
          category: string | null
          cover_url: string | null
          created_at: string | null
          favorite_count: number | null
          flo_track_id: string | null
          id: string
          ky_number: string | null
          preview_count: number | null
          search_count: number | null
          search_keywords: string | null
          title: string
          tj_number: string | null
        }
        Insert: {
          artist: string
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          favorite_count?: number | null
          flo_track_id?: string | null
          id?: string
          ky_number?: string | null
          preview_count?: number | null
          search_count?: number | null
          search_keywords?: string | null
          title: string
          tj_number?: string | null
        }
        Update: {
          artist?: string
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          favorite_count?: number | null
          flo_track_id?: string | null
          id?: string
          ky_number?: string | null
          preview_count?: number | null
          search_count?: number | null
          search_keywords?: string | null
          title?: string
          tj_number?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          member_no: string
          nickname: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          member_no: string
          nickname: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          member_no?: string
          nickname?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      song_metadata_overrides: {
        Row: {
          cover_url: string | null
          created_at: string
          flo_track_id: string | null
          id: string
          is_active: boolean
          note: string | null
          song_id: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          flo_track_id?: string | null
          id?: string
          is_active?: boolean
          note?: string | null
          song_id: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          flo_track_id?: string | null
          id?: string
          is_active?: boolean
          note?: string | null
          song_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_metadata_overrides_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: true
            referencedRelation: "karaoke_songs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_song_stat: {
        Args: { song_id: string; stat_type: string }
        Returns: undefined
      }
      normalize_karaoke_text: { Args: { input_text: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      strip_spaces: { Args: { "": string }; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
