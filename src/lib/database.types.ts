// Generated/trimmed Supabase types for the Dialed schema (beans, recipes, brew_logs).
// Regenerate with: supabase gen types typescript --project-id <ref>

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      beans: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          origin: string | null;
          process: string | null;
          roast_level: string | null;
          roast_date: string | null;
          roaster: string | null;
          tasting_notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          origin?: string | null;
          process?: string | null;
          roast_level?: string | null;
          roast_date?: string | null;
          roaster?: string | null;
          tasting_notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["beans"]["Insert"]>;
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          created_at: string;
          bean_id: string | null;
          bean_label: string | null;
          name: string;
          dripper: string | null;
          grinder: string | null;
          click_setting: string | null;
          water_temp: number | null;
          dose_g: number | null;
          water_g: number | null;
          ratio: string | null;
          pour_schedule: Json;
          target_time: string | null;
          notes: string | null;
          is_favorite: boolean;
          finished: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          bean_id?: string | null;
          bean_label?: string | null;
          name: string;
          dripper?: string | null;
          grinder?: string | null;
          click_setting?: string | null;
          water_temp?: number | null;
          dose_g?: number | null;
          water_g?: number | null;
          ratio?: string | null;
          pour_schedule?: Json;
          target_time?: string | null;
          notes?: string | null;
          is_favorite?: boolean;
          finished?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["recipes"]["Insert"]>;
        Relationships: [];
      };
      brew_comments: {
        Row: {
          id: string;
          created_at: string;
          brew_log_id: string;
          author: string;
          comment: string | null;
          acidity: number | null;
          body: number | null;
          sweetness: number | null;
          bitterness: number | null;
          clarity: number | null;
          overall: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          brew_log_id: string;
          author: string;
          comment?: string | null;
          acidity?: number | null;
          body?: number | null;
          sweetness?: number | null;
          bitterness?: number | null;
          clarity?: number | null;
          overall?: number | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["brew_comments"]["Insert"]
        >;
        Relationships: [];
      };
      brew_logs: {
        Row: {
          id: string;
          created_at: string;
          recipe_id: string;
          brew_date: string;
          actual_time: string | null;
          brewer_note: string | null;
          click_setting: string | null;
          grinder: string | null;
          acidity: number | null;
          body: number | null;
          sweetness: number | null;
          bitterness: number | null;
          clarity: number | null;
          overall: number | null;
          flavor_notes: string | null;
          aroma_notes: string | null;
          next_adjustment: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          recipe_id: string;
          brew_date?: string;
          actual_time?: string | null;
          brewer_note?: string | null;
          click_setting?: string | null;
          grinder?: string | null;
          acidity?: number | null;
          body?: number | null;
          sweetness?: number | null;
          bitterness?: number | null;
          clarity?: number | null;
          overall?: number | null;
          flavor_notes?: string | null;
          aroma_notes?: string | null;
          next_adjustment?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["brew_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
