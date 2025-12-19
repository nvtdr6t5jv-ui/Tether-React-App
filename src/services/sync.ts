import { supabase } from './supabase';
import { api } from './api';
import { storageService } from './StorageService';
import { Friend as LocalFriend, Interaction as LocalInteraction, CalendarEvent as LocalCalendarEvent } from '../types';
import { Friend as DbFriend, Interaction as DbInteraction, CalendarEvent as DbCalendarEvent } from './database.types';

const mapDbFriendToLocal = (dbFriend: DbFriend): LocalFriend => ({
  id: dbFriend.id,
  name: dbFriend.name,
  initials: dbFriend.initials,
  orbitId: dbFriend.orbit_id,
  phone: dbFriend.phone || undefined,
  email: dbFriend.email || undefined,
  birthday: dbFriend.birthday || undefined,
  notes: dbFriend.notes || undefined,
  howMet: dbFriend.how_met || undefined,
  photo: undefined,
  isFavorite: dbFriend.is_favorite,
  reminderFrequency: dbFriend.reminder_frequency,
  lastContact: dbFriend.last_contact ? new Date(dbFriend.last_contact) : undefined,
  nextNudge: undefined,
  tags: [],
  createdAt: new Date(dbFriend.created_at),
  updatedAt: new Date(dbFriend.updated_at),
  streak: 0,
});

const mapLocalFriendToDb = (localFriend: LocalFriend, userId: string): Partial<DbFriend> => ({
  user_id: userId,
  name: localFriend.name,
  initials: localFriend.initials,
  orbit_id: localFriend.orbitId as any,
  phone: localFriend.phone || null,
  email: localFriend.email || null,
  birthday: localFriend.birthday || null,
  notes: localFriend.notes || null,
  how_met: localFriend.howMet || null,
  is_favorite: localFriend.isFavorite || false,
  reminder_frequency: (localFriend.reminderFrequency || 'monthly') as any,
  last_contact: localFriend.lastContact?.toISOString() || null,
});

const mapDbInteractionToLocal = (dbInteraction: DbInteraction): LocalInteraction => ({
  id: dbInteraction.id,
  friendId: dbInteraction.friend_id,
  type: dbInteraction.type,
  note: dbInteraction.note || undefined,
  date: new Date(dbInteraction.date),
  createdAt: new Date(dbInteraction.created_at),
});

const mapDbEventToLocal = (dbEvent: DbCalendarEvent): LocalCalendarEvent => ({
  id: dbEvent.id,
  title: dbEvent.title,
  description: dbEvent.description || undefined,
  startDate: new Date(dbEvent.start_date),
  endDate: dbEvent.end_date ? new Date(dbEvent.end_date) : undefined,
  friendId: dbEvent.friend_id || undefined,
  type: 'hangout',
  location: dbEvent.location || undefined,
  isAllDay: dbEvent.is_all_day,
});

export const syncService = {
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  },

  async syncToCloud(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const [localFriends, localInteractions, localEvents] = await Promise.all([
        storageService.getFriends(),
        storageService.getInteractions(),
        storageService.getCalendarEvents(),
      ]);

      for (const friend of localFriends) {
        const existing = await api.friends.getById(friend.id);
        if (existing) {
          await api.friends.update(friend.id, mapLocalFriendToDb(friend, user.id) as any);
        } else {
          await supabase.from('friends').insert({
            id: friend.id,
            ...mapLocalFriendToDb(friend, user.id),
          });
        }
      }

      for (const interaction of localInteractions) {
        await supabase.from('interactions').upsert({
          id: interaction.id,
          user_id: user.id,
          friend_id: interaction.friendId,
          type: interaction.type as any,
          note: interaction.note || null,
          date: interaction.date.toISOString(),
        });
      }

      for (const event of localEvents) {
        await supabase.from('calendar_events').upsert({
          id: event.id,
          user_id: user.id,
          friend_id: event.friendId || null,
          title: event.title,
          description: event.description || null,
          start_date: event.startDate.toISOString(),
          end_date: event.endDate?.toISOString() || null,
          is_all_day: event.isAllDay || false,
          location: event.location || null,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Sync to cloud failed:', error);
      return { success: false, error: error.message };
    }
  },

  async syncFromCloud(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const [dbFriends, dbInteractions, dbEvents] = await Promise.all([
        api.friends.getAll(),
        api.interactions.getAll(),
        api.calendarEvents.getAll(),
      ]);

      const localFriends = dbFriends.map(mapDbFriendToLocal);
      const localInteractions = dbInteractions.map(mapDbInteractionToLocal);
      const localEvents = dbEvents.map(mapDbEventToLocal);

      await Promise.all([
        storageService.saveFriends(localFriends),
        storageService.saveInteractions(localInteractions),
        storageService.saveCalendarEvents(localEvents),
      ]);

      return { success: true };
    } catch (error: any) {
      console.error('Sync from cloud failed:', error);
      return { success: false, error: error.message };
    }
  },

  async fullSync(): Promise<{ success: boolean; error?: string }> {
    const toCloudResult = await this.syncToCloud();
    if (!toCloudResult.success) {
      return toCloudResult;
    }

    return this.syncFromCloud();
  },

  async clearCloudData(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      await supabase.from('interactions').delete().eq('user_id', user.id);
      await supabase.from('reminders').delete().eq('user_id', user.id);
      await supabase.from('achievements').delete().eq('user_id', user.id);
      await supabase.from('calendar_events').delete().eq('user_id', user.id);
      await supabase.from('friends').delete().eq('user_id', user.id);

      return { success: true };
    } catch (error: any) {
      console.error('Clear cloud data failed:', error);
      return { success: false, error: error.message };
    }
  },

  subscribeToChanges(callback: () => void): () => void {
    const friendsSubscription = supabase
      .channel('friends-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, callback)
      .subscribe();

    const interactionsSubscription = supabase
      .channel('interactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interactions' }, callback)
      .subscribe();

    return () => {
      friendsSubscription.unsubscribe();
      interactionsSubscription.unsubscribe();
    };
  },
};
