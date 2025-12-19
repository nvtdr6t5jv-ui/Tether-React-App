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
  lastContact: dbFriend.last_contact ? new Date(dbFriend.last_contact) : null,
  nextNudge: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
  last_contact: localFriend.lastContact instanceof Date ? localFriend.lastContact.toISOString() : (localFriend.lastContact || null),
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
  notes: dbEvent.description || undefined,
  date: new Date(dbEvent.start_date),
  endDate: dbEvent.end_date ? new Date(dbEvent.end_date) : undefined,
  friendId: dbEvent.friend_id || undefined,
  type: 'custom',
  isRecurring: false,
  isCompleted: false,
  createdAt: new Date(),
});

const getDateString = (date: Date | string | undefined | null): string | null => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return null;
};

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
        const dateStr = getDateString(interaction.date);
        if (!dateStr || !interaction.friendId) continue;
        
        await supabase.from('interactions').upsert({
          id: interaction.id,
          user_id: user.id,
          friend_id: interaction.friendId,
          type: interaction.type as any,
          note: interaction.note || null,
          date: dateStr,
        });
      }

      for (const event of localEvents) {
        const startDateStr = getDateString(event.date);
        if (!startDateStr) continue;
        
        await supabase.from('calendar_events').upsert({
          id: event.id,
          user_id: user.id,
          friend_id: event.friendId || null,
          title: event.title,
          description: event.notes || null,
          start_date: startDateStr,
          end_date: getDateString(event.endDate),
          is_all_day: false,
          location: null,
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

      if (dbFriends.length === 0 && dbInteractions.length === 0 && dbEvents.length === 0) {
        return { success: true };
      }

      const [localFriends, localInteractions, localEvents] = await Promise.all([
        storageService.getFriends(),
        storageService.getInteractions(),
        storageService.getCalendarEvents(),
      ]);

      const cloudFriends = dbFriends.map(mapDbFriendToLocal);
      const cloudInteractions = dbInteractions.map(mapDbInteractionToLocal);
      const cloudEvents = dbEvents.map(mapDbEventToLocal);

      const mergedFriends = [...localFriends];
      for (const cloudFriend of cloudFriends) {
        const existingByIdIndex = mergedFriends.findIndex(f => f.id === cloudFriend.id);
        if (existingByIdIndex >= 0) {
          const local = mergedFriends[existingByIdIndex];
          if (cloudFriend.updatedAt > local.updatedAt) {
            mergedFriends[existingByIdIndex] = cloudFriend;
          }
        } else {
          const existingByPhoneOrEmail = mergedFriends.findIndex(f => 
            (f.phone && cloudFriend.phone && f.phone === cloudFriend.phone) ||
            (f.email && cloudFriend.email && f.email === cloudFriend.email) ||
            (f.name === cloudFriend.name && f.orbitId === cloudFriend.orbitId)
          );
          if (existingByPhoneOrEmail < 0) {
            mergedFriends.push(cloudFriend);
          }
        }
      }

      const mergedInteractions = [...localInteractions];
      for (const cloudInt of cloudInteractions) {
        if (!mergedInteractions.some(i => i.id === cloudInt.id)) {
          mergedInteractions.push(cloudInt);
        }
      }

      const mergedEvents = [...localEvents];
      for (const cloudEvent of cloudEvents) {
        if (!mergedEvents.some(e => e.id === cloudEvent.id)) {
          mergedEvents.push(cloudEvent);
        }
      }

      await Promise.all([
        storageService.saveFriends(mergedFriends),
        storageService.saveInteractions(mergedInteractions),
        storageService.saveCalendarEvents(mergedEvents),
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
