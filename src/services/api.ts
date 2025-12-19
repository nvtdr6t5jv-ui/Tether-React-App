import { supabase } from './supabase';
import {
  Profile,
  Friend,
  Interaction,
  Reminder,
  Achievement,
  CalendarEvent,
  OrbitType,
  InteractionType,
  ReminderFrequency,
} from './database.types';

export interface CloudFriendData {
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
}

export interface CloudInteractionData {
  id: string;
  user_id: string;
  friend_id: string;
  type: InteractionType;
  date: string;
  created_at: string;
}

export const api = {
  profiles: {
    async get(): Promise<Profile | null> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },

    async update(updates: Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>): Promise<Profile> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateStreak(current: number, longest: number): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await supabase
        .from('profiles')
        .update({
          streak_current: current,
          streak_longest: longest,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    },

    async addXP(amount: number): Promise<{ totalXp: number; level: number }> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profile = await this.get();
      if (!profile) throw new Error('Profile not found');

      const newXp = profile.total_xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;

      await supabase
        .from('profiles')
        .update({
          total_xp: newXp,
          level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return { totalXp: newXp, level: newLevel };
    },
  },

  friends: {
    async getAll(): Promise<CloudFriendData[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },

    async getById(id: string): Promise<CloudFriendData | null> {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return data;
    },

    async create(friend: {
      id: string;
      phoneHash: string | null;
      orbitId: OrbitType;
      isFavorite?: boolean;
      reminderFrequency?: ReminderFrequency;
      lastContact?: string | null;
      streak?: number;
    }): Promise<CloudFriendData> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('friends')
        .insert({
          id: friend.id,
          user_id: user.id,
          phone_hash: friend.phoneHash,
          orbit_id: friend.orbitId,
          is_favorite: friend.isFavorite || false,
          reminder_frequency: friend.reminderFrequency || 'monthly',
          last_contact: friend.lastContact || null,
          streak: friend.streak || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: {
      phoneHash?: string | null;
      orbitId?: OrbitType;
      isFavorite?: boolean;
      reminderFrequency?: ReminderFrequency;
      lastContact?: string | null;
      streak?: number;
    }): Promise<CloudFriendData | null> {
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (updates.phoneHash !== undefined) updateData.phone_hash = updates.phoneHash;
      if (updates.orbitId !== undefined) updateData.orbit_id = updates.orbitId;
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;
      if (updates.reminderFrequency !== undefined) updateData.reminder_frequency = updates.reminderFrequency;
      if (updates.lastContact !== undefined) updateData.last_contact = updates.lastContact;
      if (updates.streak !== undefined) updateData.streak = updates.streak;

      const { data, error } = await supabase
        .from('friends')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },

    async delete(id: string): Promise<void> {
      await supabase.from('interactions').delete().eq('friend_id', id);
      await supabase.from('reminders').delete().eq('friend_id', id);
      await supabase.from('calendar_events').delete().eq('friend_id', id);

      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    async toggleFavorite(id: string): Promise<boolean> {
      const friend = await this.getById(id);
      if (!friend) throw new Error('Friend not found');

      const { data, error } = await supabase
        .from('friends')
        .update({ is_favorite: !friend.is_favorite, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data.is_favorite;
    },

    async updateLastContact(id: string, date?: Date): Promise<void> {
      await supabase
        .from('friends')
        .update({
          last_contact: (date || new Date()).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    },
  },

  interactions: {
    async getAll(): Promise<CloudInteractionData[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getByFriend(friendId: string): Promise<CloudInteractionData[]> {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('friend_id', friendId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async create(interaction: {
      id: string;
      friendId: string;
      type: InteractionType;
      date?: Date;
    }): Promise<CloudInteractionData> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('interactions')
        .insert({
          id: interaction.id,
          user_id: user.id,
          friend_id: interaction.friendId,
          type: interaction.type,
          date: interaction.date ? (typeof interaction.date === 'string' ? interaction.date : interaction.date.toISOString()) : new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await api.friends.updateLastContact(interaction.friendId, interaction.date);

      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    async getStats(): Promise<{
      totalConnections: number;
      connectionsThisWeek: number;
      connectionsThisMonth: number;
      byType: Record<InteractionType, number>;
    }> {
      const interactions = await this.getAll();
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const byType: Record<InteractionType, number> = {
        call: 0,
        text: 0,
        in_person: 0,
        video: 0,
        social: 0,
        other: 0,
      };

      let connectionsThisWeek = 0;
      let connectionsThisMonth = 0;

      interactions.forEach(i => {
        byType[i.type]++;
        const date = new Date(i.date);
        if (date >= weekAgo) connectionsThisWeek++;
        if (date >= monthAgo) connectionsThisMonth++;
      });

      return {
        totalConnections: interactions.length,
        connectionsThisWeek,
        connectionsThisMonth,
        byType,
      };
    },
  },

  reminders: {
    async getAll(): Promise<Reminder[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date');

      if (error) throw error;
      return data || [];
    },

    async getUpcoming(): Promise<Reminder[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date')
        .limit(10);

      if (error) throw error;
      return data || [];
    },

    async create(reminder: {
      friendId: string;
      scheduledDate: Date;
    }): Promise<Reminder> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          friend_id: reminder.friendId,
          scheduled_date: reminder.scheduledDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async complete(id: string): Promise<void> {
      await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', id);
    },

    async delete(id: string): Promise<void> {
      await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
    },
  },

  achievements: {
    async getUnlocked(): Promise<Achievement[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },

    async unlock(achievementId: string): Promise<Achievement | null> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const existing = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .single();

      if (existing.data) return existing.data;

      const { data, error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  },

  calendarEvents: {
    async getAll(): Promise<CalendarEvent[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date');

      if (error) throw error;
      return data || [];
    },

    async getUpcoming(days: number = 30): Promise<CalendarEvent[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const now = new Date();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', now.toISOString())
        .lte('start_date', future.toISOString())
        .order('start_date');

      if (error) throw error;
      return data || [];
    },

    async create(event: {
      id: string;
      friendId?: string;
      title: string;
      startDate: Date;
      endDate?: Date;
      isAllDay?: boolean;
      location?: string;
      externalId?: string;
    }): Promise<CalendarEvent> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          id: event.id,
          user_id: user.id,
          friend_id: event.friendId,
          title: event.title,
          start_date: event.startDate.toISOString(),
          end_date: event.endDate?.toISOString(),
          is_all_day: event.isAllDay || false,
          location: event.location,
          external_id: event.externalId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>>): Promise<CalendarEvent> {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id: string): Promise<void> {
      await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
    },
  },

  async exportUserData(): Promise<object> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const [profile, friends, interactions, reminders, achievements, events] = await Promise.all([
      api.profiles.get(),
      api.friends.getAll(),
      api.interactions.getAll(),
      api.reminders.getAll(),
      api.achievements.getUnlocked(),
      api.calendarEvents.getAll(),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      profile,
      friends,
      interactions,
      reminders,
      achievements,
      calendarEvents: events,
    };
  },
};
