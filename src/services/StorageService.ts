import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Friend,
  Note,
  Interaction,
  Nudge,
  Draft,
  UserProfile,
  UserSettings,
  PremiumStatus,
} from '../types';

const STORAGE_KEYS = {
  FRIENDS: '@tether/friends',
  NOTES: '@tether/notes',
  INTERACTIONS: '@tether/interactions',
  NUDGES: '@tether/nudges',
  DRAFTS: '@tether/drafts',
  USER_PROFILE: '@tether/user_profile',
  USER_SETTINGS: '@tether/user_settings',
  PREMIUM_STATUS: '@tether/premium_status',
  IS_ONBOARDED: '@tether/is_onboarded',
  MANUAL_CONTACTS_ADDED: '@tether/manual_contacts_added',
};

const parseDate = (dateString: string | Date | null): Date | null => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  return new Date(dateString);
};

const parseFriend = (data: any): Friend => ({
  ...data,
  lastContact: parseDate(data.lastContact),
  nextNudge: parseDate(data.nextNudge) || new Date(),
  createdAt: parseDate(data.createdAt) || new Date(),
  updatedAt: parseDate(data.updatedAt) || new Date(),
  tags: data.tags || [],
  streak: data.streak || 0,
  isFavorite: data.isFavorite || false,
});

const parseNote = (data: any): Note => ({
  ...data,
  createdAt: parseDate(data.createdAt) || new Date(),
  updatedAt: parseDate(data.updatedAt) || new Date(),
});

const parseInteraction = (data: any): Interaction => ({
  ...data,
  date: parseDate(data.date) || new Date(),
  createdAt: parseDate(data.createdAt) || new Date(),
});

const parseNudge = (data: any): Nudge => ({
  ...data,
  dueDate: parseDate(data.dueDate) || new Date(),
  completedAt: parseDate(data.completedAt),
  snoozedUntil: parseDate(data.snoozedUntil),
  createdAt: parseDate(data.createdAt) || new Date(),
});

const parseDraft = (data: any): Draft => ({
  ...data,
  createdAt: parseDate(data.createdAt) || new Date(),
  updatedAt: parseDate(data.updatedAt) || new Date(),
});

class StorageService {
  async getFriends(): Promise<Friend[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FRIENDS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return parsed.map(parseFriend);
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  async saveFriends(friends: Friend[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
    } catch (error) {
      console.error('Error saving friends:', error);
    }
  }

  async addFriend(friend: Friend): Promise<void> {
    const friends = await this.getFriends();
    friends.push(friend);
    await this.saveFriends(friends);
  }

  async updateFriend(friendId: string, updates: Partial<Friend>): Promise<Friend | null> {
    const friends = await this.getFriends();
    const index = friends.findIndex(f => f.id === friendId);
    if (index === -1) return null;
    
    friends[index] = { ...friends[index], ...updates, updatedAt: new Date() };
    await this.saveFriends(friends);
    return friends[index];
  }

  async deleteFriend(friendId: string): Promise<void> {
    const friends = await this.getFriends();
    const filtered = friends.filter(f => f.id !== friendId);
    await this.saveFriends(filtered);
    
    const notes = await this.getNotes();
    await this.saveNotes(notes.filter(n => n.friendId !== friendId));
    
    const interactions = await this.getInteractions();
    await this.saveInteractions(interactions.filter(i => i.friendId !== friendId));
    
    const nudges = await this.getNudges();
    await this.saveNudges(nudges.filter(n => n.friendId !== friendId));
  }

  async getNotes(): Promise<Note[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      if (!data) return [];
      return JSON.parse(data).map(parseNote);
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  async saveNotes(notes: Note[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }

  async addNote(note: Note): Promise<void> {
    const notes = await this.getNotes();
    notes.push(note);
    await this.saveNotes(notes);
  }

  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const notes = await this.getNotes();
    const index = notes.findIndex(n => n.id === noteId);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates, updatedAt: new Date() };
      await this.saveNotes(notes);
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    const notes = await this.getNotes();
    await this.saveNotes(notes.filter(n => n.id !== noteId));
  }

  async getNotesByFriend(friendId: string): Promise<Note[]> {
    const notes = await this.getNotes();
    return notes.filter(n => n.friendId === friendId);
  }

  async getInteractions(): Promise<Interaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INTERACTIONS);
      if (!data) return [];
      return JSON.parse(data).map(parseInteraction);
    } catch (error) {
      console.error('Error getting interactions:', error);
      return [];
    }
  }

  async saveInteractions(interactions: Interaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(interactions));
    } catch (error) {
      console.error('Error saving interactions:', error);
    }
  }

  async addInteraction(interaction: Interaction): Promise<void> {
    const interactions = await this.getInteractions();
    interactions.push(interaction);
    await this.saveInteractions(interactions);
  }

  async getInteractionsByFriend(friendId: string): Promise<Interaction[]> {
    const interactions = await this.getInteractions();
    return interactions.filter(i => i.friendId === friendId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getNudges(): Promise<Nudge[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NUDGES);
      if (!data) return [];
      return JSON.parse(data).map(parseNudge);
    } catch (error) {
      console.error('Error getting nudges:', error);
      return [];
    }
  }

  async saveNudges(nudges: Nudge[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NUDGES, JSON.stringify(nudges));
    } catch (error) {
      console.error('Error saving nudges:', error);
    }
  }

  async addNudge(nudge: Nudge): Promise<void> {
    const nudges = await this.getNudges();
    nudges.push(nudge);
    await this.saveNudges(nudges);
  }

  async updateNudge(nudgeId: string, updates: Partial<Nudge>): Promise<void> {
    const nudges = await this.getNudges();
    const index = nudges.findIndex(n => n.id === nudgeId);
    if (index !== -1) {
      nudges[index] = { ...nudges[index], ...updates };
      await this.saveNudges(nudges);
    }
  }

  async getDrafts(): Promise<Draft[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS);
      if (!data) return [];
      return JSON.parse(data).map(parseDraft);
    } catch (error) {
      console.error('Error getting drafts:', error);
      return [];
    }
  }

  async saveDrafts(drafts: Draft[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    } catch (error) {
      console.error('Error saving drafts:', error);
    }
  }

  async addDraft(draft: Draft): Promise<void> {
    const drafts = await this.getDrafts();
    drafts.push(draft);
    await this.saveDrafts(drafts);
  }

  async deleteDraft(draftId: string): Promise<void> {
    const drafts = await this.getDrafts();
    await this.saveDrafts(drafts.filter(d => d.id !== draftId));
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        memberSince: parseDate(parsed.memberSince) || new Date(),
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async getUserSettings(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (!data) return this.getDefaultSettings();
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting user settings:', error);
      return this.getDefaultSettings();
    }
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }

  getDefaultSettings(): UserSettings {
    return {
      theme: 'system',
      notificationsEnabled: true,
      notificationFrequency: 'daily',
      notificationTime: '09:00',
      vacationMode: false,
      contactsSynced: false,
      hapticFeedback: true,
    };
  }

  async getIsOnboarded(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARDED);
      return data === 'true';
    } catch (error) {
      return false;
    }
  }

  async setIsOnboarded(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, value.toString());
    } catch (error) {
      console.error('Error saving onboarded state:', error);
    }
  }

  async clearManualContactsFlag(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.MANUAL_CONTACTS_ADDED);
    } catch (error) {
      console.error('Error clearing manual contacts flag:', error);
    }
  }

  async getPremiumStatus(): Promise<PremiumStatus | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      };
    } catch (error) {
      console.error('Error getting premium status:', error);
      return null;
    }
  }

  async savePremiumStatus(status: PremiumStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving premium status:', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const storageService = new StorageService();
