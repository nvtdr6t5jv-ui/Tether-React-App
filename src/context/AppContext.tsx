import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Friend,
  Note,
  Interaction,
  Nudge,
  Draft,
  UserProfile,
  UserSettings,
  SocialHealthStats,
  PremiumStatus,
  ORBITS,
  InteractionType,
  NoteType,
  FREE_CONTACT_LIMIT,
  FREE_HISTORY_DAYS,
} from '../types';
import { storageService } from '../services/StorageService';

interface AppState {
  isLoading: boolean;
  isOnboarded: boolean;
  friends: Friend[];
  notes: Note[];
  interactions: Interaction[];
  nudges: Nudge[];
  drafts: Draft[];
  userProfile: UserProfile | null;
  userSettings: UserSettings;
  premiumStatus: PremiumStatus;
}

interface AppContextType extends AppState {
  completeOnboarding: (friends: Friend[]) => Promise<void>;
  addFriend: (friend: Omit<Friend, 'id' | 'createdAt' | 'updatedAt' | 'streak'>) => Promise<Friend>;
  updateFriend: (friendId: string, updates: Partial<Friend>) => Promise<void>;
  deleteFriend: (friendId: string) => Promise<void>;
  toggleFavorite: (friendId: string) => Promise<void>;
  addNote: (friendId: string, type: NoteType, content: string) => Promise<Note>;
  updateNote: (noteId: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  logInteraction: (friendId: string, type: InteractionType, note?: string, duration?: number) => Promise<void>;
  addDraft: (friendId: string, content: string) => Promise<Draft>;
  deleteDraft: (draftId: string) => Promise<void>;
  sendDraft: (draftId: string) => Promise<void>;
  completeNudge: (nudgeId: string) => Promise<void>;
  snoozeNudge: (nudgeId: string, days: number) => Promise<void>;
  dismissNudge: (nudgeId: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserSettings: (updates: Partial<UserSettings>) => Promise<void>;
  getSocialHealthStats: () => SocialHealthStats;
  getUpcomingBirthdays: () => { friend: Friend; daysUntil: number }[];
  getOverdueFriends: () => Friend[];
  getFriendById: (id: string) => Friend | undefined;
  getNotesByFriend: (friendId: string) => Note[];
  getInteractionsByFriend: (friendId: string) => Interaction[];
  getInteractionsByFriendLimited: (friendId: string) => Interaction[];
  refreshData: () => Promise<void>;
  resetApp: () => Promise<void>;
  canAddMoreFriends: () => boolean;
  getRemainingFreeSlots: () => number;
  upgradeToPremium: (plan: 'monthly' | 'yearly') => Promise<void>;
  getSmartSuggestion: (friendId: string) => string | null;
}

const getDefaultSettings = (): UserSettings => ({
  theme: 'system',
  notificationsEnabled: true,
  notificationFrequency: 'daily',
  notificationTime: '09:00',
  vacationMode: false,
  contactsSynced: false,
  hapticFeedback: true,
});

const getDefaultPremiumStatus = (): PremiumStatus => ({
  isPremium: false,
  trialUsed: false,
});

const initialState: AppState = {
  isLoading: true,
  isOnboarded: false,
  friends: [],
  notes: [],
  interactions: [],
  nudges: [],
  drafts: [],
  userProfile: null,
  userSettings: getDefaultSettings(),
  premiumStatus: getDefaultPremiumStatus(),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const getNextNudgeDate = (orbitId: string): Date => {
  const orbit = ORBITS.find(o => o.id === orbitId);
  const days = orbit?.daysInterval || 14;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const calculateStreak = (interactions: Interaction[], orbitId: string): number => {
  if (interactions.length === 0) return 0;
  
  const orbit = ORBITS.find(o => o.id === orbitId);
  const intervalDays = orbit?.daysInterval || 14;
  
  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let lastDate = new Date();
  
  for (const interaction of sortedInteractions) {
    const interactionDate = new Date(interaction.date);
    const daysDiff = Math.floor((lastDate.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= intervalDays * 1.5) {
      streak++;
      lastDate = interactionDate;
    } else {
      break;
    }
  }
  
  return streak;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const loadData = useCallback(async () => {
    try {
      const [
        isOnboarded,
        friends,
        notes,
        interactions,
        nudges,
        drafts,
        userProfile,
        userSettings,
        premiumStatus,
      ] = await Promise.all([
        storageService.getIsOnboarded(),
        storageService.getFriends(),
        storageService.getNotes(),
        storageService.getInteractions(),
        storageService.getNudges(),
        storageService.getDrafts(),
        storageService.getUserProfile(),
        storageService.getUserSettings(),
        storageService.getPremiumStatus(),
      ]);

      setState({
        isLoading: false,
        isOnboarded,
        friends,
        notes,
        interactions,
        nudges,
        drafts,
        userProfile,
        userSettings,
        premiumStatus: premiumStatus || getDefaultPremiumStatus(),
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
    storageService.clearManualContactsFlag();
  }, [loadData]);

  const completeOnboarding = async (friends: Friend[]) => {
    const now = new Date();
    const processedFriends = friends.map(f => ({
      ...f,
      createdAt: now,
      updatedAt: now,
      streak: 0,
      tags: f.tags || [],
      isFavorite: f.orbitId === 'inner',
    }));

    const defaultProfile: UserProfile = {
      id: storageService.generateId(),
      name: 'Alex Rivera',
      memberSince: now,
    };

    await Promise.all([
      storageService.saveFriends(processedFriends),
      storageService.setIsOnboarded(true),
      storageService.saveUserProfile(defaultProfile),
    ]);

    setState(prev => ({
      ...prev,
      isOnboarded: true,
      friends: processedFriends,
      userProfile: defaultProfile,
    }));
  };

  const addFriend = async (friendData: Omit<Friend, 'id' | 'createdAt' | 'updatedAt' | 'streak'>): Promise<Friend> => {
    const now = new Date();
    const friend: Friend = {
      ...friendData,
      id: storageService.generateId(),
      createdAt: now,
      updatedAt: now,
      streak: 0,
    };

    await storageService.addFriend(friend);
    setState(prev => ({ ...prev, friends: [...prev.friends, friend] }));
    return friend;
  };

  const updateFriend = async (friendId: string, updates: Partial<Friend>) => {
    const updated = await storageService.updateFriend(friendId, updates);
    if (updated) {
      setState(prev => ({
        ...prev,
        friends: prev.friends.map(f => f.id === friendId ? updated : f),
      }));
    }
  };

  const deleteFriend = async (friendId: string) => {
    await storageService.deleteFriend(friendId);
    setState(prev => ({
      ...prev,
      friends: prev.friends.filter(f => f.id !== friendId),
      notes: prev.notes.filter(n => n.friendId !== friendId),
      interactions: prev.interactions.filter(i => i.friendId !== friendId),
      nudges: prev.nudges.filter(n => n.friendId !== friendId),
      drafts: prev.drafts.filter(d => d.friendId !== friendId),
    }));
  };

  const toggleFavorite = async (friendId: string) => {
    const friend = state.friends.find(f => f.id === friendId);
    if (friend) {
      await updateFriend(friendId, { isFavorite: !friend.isFavorite });
    }
  };

  const addNote = async (friendId: string, type: NoteType, content: string): Promise<Note> => {
    const now = new Date();
    const note: Note = {
      id: storageService.generateId(),
      friendId,
      type,
      content,
      createdAt: now,
      updatedAt: now,
    };

    await storageService.addNote(note);
    setState(prev => ({ ...prev, notes: [...prev.notes, note] }));
    return note;
  };

  const updateNote = async (noteId: string, content: string) => {
    await storageService.updateNote(noteId, { content });
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.id === noteId ? { ...n, content, updatedAt: new Date() } : n),
    }));
  };

  const deleteNote = async (noteId: string) => {
    await storageService.deleteNote(noteId);
    setState(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== noteId) }));
  };

  const logInteraction = async (friendId: string, type: InteractionType, note?: string, duration?: number) => {
    const now = new Date();
    const interaction: Interaction = {
      id: storageService.generateId(),
      friendId,
      type,
      note,
      duration,
      date: now,
      createdAt: now,
    };

    await storageService.addInteraction(interaction);
    
    const friend = state.friends.find(f => f.id === friendId);
    if (friend) {
      const friendInteractions = [...state.interactions.filter(i => i.friendId === friendId), interaction];
      const newStreak = calculateStreak(friendInteractions, friend.orbitId);
      
      await storageService.updateFriend(friendId, {
        lastContact: now,
        nextNudge: getNextNudgeDate(friend.orbitId),
        streak: newStreak,
      });

      setState(prev => ({
        ...prev,
        interactions: [...prev.interactions, interaction],
        friends: prev.friends.map(f => f.id === friendId ? {
          ...f,
          lastContact: now,
          nextNudge: getNextNudgeDate(f.orbitId),
          streak: newStreak,
        } : f),
      }));
    } else {
      setState(prev => ({ ...prev, interactions: [...prev.interactions, interaction] }));
    }
  };

  const addDraft = async (friendId: string, content: string): Promise<Draft> => {
    const now = new Date();
    const draft: Draft = {
      id: storageService.generateId(),
      friendId,
      content,
      createdAt: now,
      updatedAt: now,
    };

    await storageService.addDraft(draft);
    setState(prev => ({ ...prev, drafts: [...prev.drafts, draft] }));
    return draft;
  };

  const deleteDraft = async (draftId: string) => {
    await storageService.deleteDraft(draftId);
    setState(prev => ({ ...prev, drafts: prev.drafts.filter(d => d.id !== draftId) }));
  };

  const sendDraft = async (draftId: string) => {
    const draft = state.drafts.find(d => d.id === draftId);
    if (draft) {
      await logInteraction(draft.friendId, 'text', draft.content);
      await deleteDraft(draftId);
    }
  };

  const completeNudge = async (nudgeId: string) => {
    await storageService.updateNudge(nudgeId, { status: 'completed', completedAt: new Date() });
    setState(prev => ({
      ...prev,
      nudges: prev.nudges.map(n => n.id === nudgeId ? { ...n, status: 'completed' as const, completedAt: new Date() } : n),
    }));
  };

  const snoozeNudge = async (nudgeId: string, days: number) => {
    const snoozedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await storageService.updateNudge(nudgeId, { status: 'snoozed', snoozedUntil });
    setState(prev => ({
      ...prev,
      nudges: prev.nudges.map(n => n.id === nudgeId ? { ...n, status: 'snoozed' as const, snoozedUntil } : n),
    }));
  };

  const dismissNudge = async (nudgeId: string) => {
    await storageService.updateNudge(nudgeId, { status: 'dismissed' });
    setState(prev => ({
      ...prev,
      nudges: prev.nudges.map(n => n.id === nudgeId ? { ...n, status: 'dismissed' as const } : n),
    }));
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (state.userProfile) {
      const updated = { ...state.userProfile, ...updates };
      await storageService.saveUserProfile(updated);
      setState(prev => ({ ...prev, userProfile: updated }));
    }
  };

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    const updated = { ...state.userSettings, ...updates };
    await storageService.saveUserSettings(updated);
    setState(prev => ({ ...prev, userSettings: updated }));
  };

  const getSocialHealthStats = (): SocialHealthStats => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const innerFriends = state.friends.filter(f => f.orbitId === 'inner');
    const closeFriends = state.friends.filter(f => f.orbitId === 'close');
    const catchupFriends = state.friends.filter(f => f.orbitId === 'catchup');

    const calculateCircleHealth = (friends: Friend[], intervalDays: number): number => {
      if (friends.length === 0) return 100;
      const healthy = friends.filter(f => {
        if (!f.lastContact) return false;
        const daysSince = (now.getTime() - new Date(f.lastContact).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= intervalDays;
      });
      return Math.round((healthy.length / friends.length) * 100);
    };

    const innerHealth = calculateCircleHealth(innerFriends, 7);
    const closeHealth = calculateCircleHealth(closeFriends, 30);
    const catchupHealth = calculateCircleHealth(catchupFriends, 90);

    const overallScore = state.friends.length > 0
      ? Math.round((innerHealth * innerFriends.length + closeHealth * closeFriends.length + catchupHealth * catchupFriends.length) / state.friends.length)
      : 100;

    const weekInteractions = state.interactions.filter(i => new Date(i.date) >= oneWeekAgo);
    const monthInteractions = state.interactions.filter(i => new Date(i.date) >= oneMonthAgo);

    const overdueCount = state.friends.filter(f => {
      if (!f.nextNudge) return true;
      return now > new Date(f.nextNudge);
    }).length;

    const streaks = state.friends.map(f => f.streak);
    const longestStreak = Math.max(0, ...streaks);
    const currentStreak = streaks.reduce((sum, s) => sum + s, 0);

    const upcomingBirthdays = getUpcomingBirthdays().length;

    return {
      overallScore,
      innerCircleHealth: innerHealth,
      closeCircleHealth: closeHealth,
      catchupCircleHealth: catchupHealth,
      totalConnections: state.friends.length,
      connectionsThisWeek: weekInteractions.length,
      connectionsThisMonth: monthInteractions.length,
      longestStreak,
      currentStreak,
      overdueCount,
      upcomingBirthdays,
    };
  };

  const getUpcomingBirthdays = (): { friend: Friend; daysUntil: number }[] => {
    const now = new Date();
    const currentYear = now.getFullYear();

    return state.friends
      .filter(f => f.birthday)
      .map(f => {
        const [month, day] = f.birthday!.split('-').slice(1).map(Number);
        let birthdayThisYear = new Date(currentYear, month - 1, day);
        
        if (birthdayThisYear < now) {
          birthdayThisYear = new Date(currentYear + 1, month - 1, day);
        }
        
        const daysUntil = Math.ceil((birthdayThisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { friend: f, daysUntil };
      })
      .filter(b => b.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const getOverdueFriends = (): Friend[] => {
    const now = new Date();
    return state.friends.filter(f => {
      if (!f.nextNudge) return true;
      return now > new Date(f.nextNudge);
    });
  };

  const getFriendById = (id: string): Friend | undefined => {
    return state.friends.find(f => f.id === id);
  };

  const getNotesByFriend = (friendId: string): Note[] => {
    return state.notes.filter(n => n.friendId === friendId);
  };

  const getInteractionsByFriend = (friendId: string): Interaction[] => {
    return state.interactions
      .filter(i => i.friendId === friendId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getInteractionsByFriendLimited = (friendId: string): Interaction[] => {
    const allInteractions = getInteractionsByFriend(friendId);
    if (state.premiumStatus.isPremium) {
      return allInteractions;
    }
    const cutoffDate = new Date(Date.now() - FREE_HISTORY_DAYS * 24 * 60 * 60 * 1000);
    return allInteractions.filter(i => new Date(i.date) >= cutoffDate);
  };

  const canAddMoreFriends = (): boolean => {
    if (state.premiumStatus.isPremium) return true;
    return state.friends.length < FREE_CONTACT_LIMIT;
  };

  const getRemainingFreeSlots = (): number => {
    if (state.premiumStatus.isPremium) return Infinity;
    return Math.max(0, FREE_CONTACT_LIMIT - state.friends.length);
  };

  const upgradeToPremium = async (plan: 'monthly' | 'yearly') => {
    const newStatus: PremiumStatus = {
      isPremium: true,
      plan,
      expiresAt: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      trialUsed: true,
    };
    await storageService.savePremiumStatus(newStatus);
    setState(prev => ({ ...prev, premiumStatus: newStatus }));
  };

  const getSmartSuggestion = (friendId: string): string | null => {
    if (!state.premiumStatus.isPremium) return null;
    
    const interactions = getInteractionsByFriend(friendId);
    if (interactions.length < 3) return null;
    
    const dayOfWeekCounts: Record<number, number> = {};
    const hourCounts: Record<number, number> = {};
    
    interactions.slice(0, 10).forEach(i => {
      const date = new Date(i.date);
      const day = date.getDay();
      const hour = date.getHours();
      dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostCommonDay = Object.entries(dayOfWeekCounts).sort((a, b) => b[1] - a[1])[0];
    
    if (mostCommonDay && mostCommonDay[1] >= 2) {
      return `You usually connect on ${days[parseInt(mostCommonDay[0])]}s`;
    }
    
    return null;
  };

  const refreshData = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await loadData();
  };

  const resetApp = async () => {
    await storageService.clearAllData();
    setState({
      ...initialState,
      isLoading: false,
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        completeOnboarding,
        addFriend,
        updateFriend,
        deleteFriend,
        toggleFavorite,
        addNote,
        updateNote,
        deleteNote,
        logInteraction,
        addDraft,
        deleteDraft,
        sendDraft,
        completeNudge,
        snoozeNudge,
        dismissNudge,
        updateUserProfile,
        updateUserSettings,
        getSocialHealthStats,
        getUpcomingBirthdays,
        getOverdueFriends,
        getFriendById,
        getNotesByFriend,
        getInteractionsByFriend,
        getInteractionsByFriendLimited,
        refreshData,
        resetApp,
        canAddMoreFriends,
        getRemainingFreeSlots,
        upgradeToPremium,
        getSmartSuggestion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export type { Friend, Note, Interaction, Nudge, Draft, UserProfile, UserSettings };
