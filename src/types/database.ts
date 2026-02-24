export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          display_name: string;
          gender: string | null;
          birth_year: string | null;
          height: string | null;
          weight: string | null;
          is_profile_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          display_name?: string;
          gender?: string | null;
          birth_year?: string | null;
          height?: string | null;
          weight?: string | null;
          is_profile_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          display_name?: string;
          gender?: string | null;
          birth_year?: string | null;
          height?: string | null;
          weight?: string | null;
          is_profile_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cal: number;
          protein: number;
          fat: number;
          carbs: number;
          fiber: number;
          salt: number;
          score: number;
          ingredients: string[];
          advice: string | null;
          missing: string | null;
          praise: string | null;
          image_url: string | null;
          feedback: string | null;
          date: string;
          time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cal: number;
          protein: number;
          fat: number;
          carbs: number;
          fiber: number;
          salt: number;
          score: number;
          ingredients: string[];
          advice?: string | null;
          missing?: string | null;
          praise?: string | null;
          image_url?: string | null;
          feedback?: string | null;
          date: string;
          time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          cal?: number;
          protein?: number;
          fat?: number;
          carbs?: number;
          fiber?: number;
          salt?: number;
          score?: number;
          ingredients?: string[];
          advice?: string | null;
          missing?: string | null;
          praise?: string | null;
          image_url?: string | null;
          feedback?: string | null;
          date?: string;
          time?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meal_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      lifestyles: {
        Row: {
          id: string;
          user_id: string;
          portion_size: string | null;
          exercise_level: string | null;
          appetite: string | null;
          meal_frequency: string | null;
          walk_minutes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          portion_size?: string | null;
          exercise_level?: string | null;
          appetite?: string | null;
          meal_frequency?: string | null;
          walk_minutes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          portion_size?: string | null;
          exercise_level?: string | null;
          appetite?: string | null;
          meal_frequency?: string | null;
          walk_minutes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lifestyles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      health_data: {
        Row: {
          id: string;
          user_id: string;
          steps: number | null;
          heart_rate: number | null;
          weight: number | null;
          blood_pressure_sys: number | null;
          blood_pressure_dia: number | null;
          sleep_hours: number | null;
          synced_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          steps?: number | null;
          heart_rate?: number | null;
          weight?: number | null;
          blood_pressure_sys?: number | null;
          blood_pressure_dia?: number | null;
          sleep_hours?: number | null;
          synced_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          steps?: number | null;
          heart_rate?: number | null;
          weight?: number | null;
          blood_pressure_sys?: number | null;
          blood_pressure_dia?: number | null;
          sleep_hours?: number | null;
          synced_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'health_data_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
