export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrbitType = 'inner' | 'close' | 'catchup';
export type InteractionType = 'call' | 'text' | 'in_person' | 'video' | 'social' | 'other';
export type ReminderFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          notification_enabled: boolean;
          notification_time: string;
          timezone: string;
          onboarding_completed: boolean;
          streak_current: number;
          streak_longest: number;
          total_xp: number;
          level: number;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          notification_enabled?: boolean;
          notification_time?: string;
          timezone?: string;
          onboarding_completed?: boolean;
          streak_current?: number;
          streak_longest?: number;
          total_xp?: number;
          level?: number;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          notification_enabled?: boolean;
          notification_time?: string;
          timezone?: string;
          onboarding_completed?: boolean;
          streak_current?: number;
          streak_longest?: number;
          total_xp?: number;
          level?: number;
        };
      };
      friends: {
        Row: {
          id: string;
          user_id: string;
          phone_hash: string | null;
          orbit_id: OrbitType;
          is_favorite: boolean;
          reminder_frequency: ReminderFrequency;
          last_contact: string | null;
          streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone_hash?: string | null;
          orbit_id: OrbitType;
          is_favorite?: boolean;
          reminder_frequency?: ReminderFrequency;
          last_contact?: string | null;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phone_hash?: string | null;
          orbit_id?: OrbitType;
          is_favorite?: boolean;
          reminder_frequency?: ReminderFrequency;
          last_contact?: string | null;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          type: InteractionType;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          type: InteractionType;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          type?: InteractionType;
          date?: string;
          created_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          scheduled_date: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          scheduled_date: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          scheduled_date?: string;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string | null;
          title: string;
          start_date: string;
          end_date: string | null;
          is_all_day: boolean;
          location: string | null;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id?: string | null;
          title: string;
          start_date: string;
          end_date?: string | null;
          is_all_day?: boolean;
          location?: string | null;
          external_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string | null;
          title?: string;
          start_date?: string;
          end_date?: string | null;
          is_all_day?: boolean;
          location?: string | null;
          external_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          platform?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      orbit_type: OrbitType;
      interaction_type: InteractionType;
      reminder_frequency: ReminderFrequency;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Friend = Database['public']['Tables']['friends']['Row'];
export type Interaction = Database['public']['Tables']['interactions']['Row'];
export type Reminder = Database['public']['Tables']['reminders']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
export type PushToken = Database['public']['Tables']['push_tokens']['Row'];
