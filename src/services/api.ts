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
    async getAll(): Promise<Friend[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    },

    async getById(id: string): Promise<Friend | null> {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return data;
    },

    async create(friend: {
      name: string;
      orbitId: OrbitType;
      phone?: string;
      email?: string;
      birthday?: string;
      notes?: string;
      howMet?: string;
      reminderFrequency?: ReminderFrequency;
    }): Promise<Friend> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const initials = friend.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          name: friend.name,
          initials,
          orbit_id: friend.orbitId,
          phone: friend.phone,
          email: friend.email,
          birthday: friend.birthday,
          notes: friend.notes,
          how_met: friend.howMet,
          reminder_frequency: friend.reminderFrequency || 'monthly',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Omit<Friend, 'id' | 'user_id' | 'created_at'>>): Promise<Friend> {
      const { data, error } = await supabase
        .from('friends')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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

    async getOverdue(): Promise<Friend[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const friends = await this.getAll();
      const now = new Date();

      return friends.filter(friend => {
        if (!friend.last_contact) return true;

        const lastContact = new Date(friend.last_contact);
        const daysSince = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

        const thresholds: Record<ReminderFrequency, number> = {
          daily: 1,
          weekly: 7,
          biweekly: 14,
          monthly: 30,
          quarterly: 90,
          yearly: 365,
        };

        return daysSince > thresholds[friend.reminder_frequency];
      });
    },
  },

  interactions: {
    async getAll(): Promise<Interaction[]> {
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

    async getByFriend(friendId: string): Promise<Interaction[]> {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('friend_id', friendId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async create(interaction: {
      friendId: string;
      type: InteractionType;
      note?: string;
      date?: Date;
    }): Promise<Interaction> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('interactions')
        .insert({
          user_id: user.id,
          friend_id: interaction.friendId,
          type: interaction.type,
          note: interaction.note,
          date: (interaction.date || new Date()).toISOString(),
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
      message?: string;
    }): Promise<Reminder> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          friend_id: reminder.friendId,
          scheduled_date: reminder.scheduledDate.toISOString(),
          message: reminder.message,
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
      friendId?: string;
      title: string;
      description?: string;
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
          user_id: user.id,
          friend_id: event.friendId,
          title: event.title,
          description: event.description,
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
