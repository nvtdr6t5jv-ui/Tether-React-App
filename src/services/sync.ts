import { supabase } from './supabase';
import { api, CloudFriendData, CloudInteractionData } from './api';
import { storageService } from './StorageService';
import { Friend as LocalFriend, Interaction as LocalInteraction, CalendarEvent as LocalCalendarEvent } from '../types';
import { CalendarEvent as DbCalendarEvent } from './database.types';
import { hashPhoneNumber } from '../utils/crypto';

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
        const phoneHash = await hashPhoneNumber(friend.phone);
        const existing = await api.friends.getById(friend.id);
        
        const cloudData = {
          orbitId: friend.orbitId as any,
          isFavorite: friend.isFavorite || false,
          reminderFrequency: (friend.reminderFrequency || 'monthly') as any,
          lastContact: friend.lastContact instanceof Date 
            ? friend.lastContact.toISOString() 
            : (friend.lastContact || null),
          streak: friend.streak || 0,
          phoneHash,
        };

        if (existing) {
          await api.friends.update(friend.id, cloudData);
        } else {
          await api.friends.create({
            id: friend.id,
            ...cloudData,
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
          start_date: startDateStr,
          end_date: getDateString(event.endDate),
          is_all_day: false,
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

      const [cloudFriendsMeta, cloudInteractions, dbEvents] = await Promise.all([
        api.friends.getAll(),
        api.interactions.getAll(),
        api.calendarEvents.getAll(),
      ]);

      if (cloudFriendsMeta.length === 0 && cloudInteractions.length === 0 && dbEvents.length === 0) {
        return { success: true };
      }

      const [localFriends, localInteractions, localEvents] = await Promise.all([
        storageService.getFriends(),
        storageService.getInteractions(),
        storageService.getCalendarEvents(),
      ]);

      const localPhoneHashes = new Map<string, LocalFriend>();
      for (const friend of localFriends) {
        if (friend.phone) {
          const hash = await hashPhoneNumber(friend.phone);
          if (hash) {
            localPhoneHashes.set(hash, friend);
          }
        }
      }

      const mergedFriends = [...localFriends];
      
      for (const cloudMeta of cloudFriendsMeta) {
        const existingById = mergedFriends.find(f => f.id === cloudMeta.id);
        
        if (existingById) {
          const cloudUpdatedAt = new Date(cloudMeta.updated_at);
          if (cloudUpdatedAt > existingById.updatedAt) {
            existingById.orbitId = cloudMeta.orbit_id;
            existingById.isFavorite = cloudMeta.is_favorite;
            existingById.reminderFrequency = cloudMeta.reminder_frequency;
            existingById.lastContact = cloudMeta.last_contact ? new Date(cloudMeta.last_contact) : null;
            existingById.streak = cloudMeta.streak;
            existingById.updatedAt = cloudUpdatedAt;
          }
        } else if (cloudMeta.phone_hash) {
          const matchedByPhone = localPhoneHashes.get(cloudMeta.phone_hash);
          if (matchedByPhone) {
            matchedByPhone.id = cloudMeta.id;
            matchedByPhone.orbitId = cloudMeta.orbit_id;
            matchedByPhone.isFavorite = cloudMeta.is_favorite;
            matchedByPhone.reminderFrequency = cloudMeta.reminder_frequency;
            matchedByPhone.lastContact = cloudMeta.last_contact ? new Date(cloudMeta.last_contact) : null;
            matchedByPhone.streak = cloudMeta.streak;
          }
        }
      }

      const mergedInteractions = [...localInteractions];
      for (const cloudInt of cloudInteractions) {
        if (!mergedInteractions.some(i => i.id === cloudInt.id)) {
          mergedInteractions.push({
            id: cloudInt.id,
            friendId: cloudInt.friend_id,
            type: cloudInt.type,
            date: new Date(cloudInt.date),
            createdAt: new Date(cloudInt.created_at),
          });
        }
      }

      const cloudEvents = dbEvents.map(mapDbEventToLocal);
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
