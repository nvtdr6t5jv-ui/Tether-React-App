import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Achievement,
  WeeklyChallenge,
  SeasonalEvent,
  Leaderboard,
  RelationshipMilestone,
  UserGarden,
  UserLevel,
  GamificationState,
  ACHIEVEMENTS,
  MOCK_WEEKLY_CHALLENGES,
  MOCK_SEASONAL_EVENT,
  MOCK_LEADERBOARD_ENTRIES,
  calculateLevel,
  getPlantStage,
  XP_PER_ACTION,
} from '../types/gamification';

const STORAGE_KEY = '@tether_gamification';

interface GamificationContextType {
  state: GamificationState;
  addXP: (amount: number, source: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  addRelationshipMilestone: (milestone: Omit<RelationshipMilestone, 'id' | 'achievedAt' | 'celebrated'>) => void;
  celebrateMilestone: (milestoneId: string) => void;
  toggleLeaderboardOptIn: () => void;
  refreshWeeklyChallenges: () => void;
  waterGarden: () => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getActiveSeasonalEvent: () => SeasonalEvent | null;
}

const defaultLevel: UserLevel = {
  level: 1,
  title: 'Social Seedling',
  currentXP: 0,
  xpToNextLevel: 100,
  totalXP: 0,
};

const defaultGarden: UserGarden = {
  plants: [
    {
      id: 'main_plant',
      name: 'Connection Tree',
      stage: 'seed',
      health: 100,
      lastWatered: new Date(),
      streakRequired: 0,
      icon: 'seed',
    },
  ],
  totalPlantsGrown: 0,
  currentStreak: 0,
  gardenHealth: 100,
};

const initializeAchievements = (): Achievement[] => {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    progress: 0,
    unlockedAt: undefined,
  }));
};

const initializeWeeklyChallenges = (): WeeklyChallenge[] => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return MOCK_WEEKLY_CHALLENGES.map(c => ({
    ...c,
    startDate: startOfWeek,
    endDate: endOfWeek,
  }));
};

const defaultState: GamificationState = {
  level: defaultLevel,
  achievements: initializeAchievements(),
  weeklyChallenges: initializeWeeklyChallenges(),
  seasonalEvents: [MOCK_SEASONAL_EVENT],
  leaderboards: [
    {
      id: 'weekly_connections',
      type: 'weekly_connections',
      title: 'Weekly Connections',
      entries: MOCK_LEADERBOARD_ENTRIES,
      userRank: 4,
      lastUpdated: new Date(),
    },
    {
      id: 'streak',
      type: 'streak',
      title: 'Longest Streaks',
      entries: [...MOCK_LEADERBOARD_ENTRIES].sort((a, b) => b.streak - a.streak).map((e, i) => ({ ...e, rank: i + 1 })),
      userRank: 6,
      lastUpdated: new Date(),
    },
  ],
  relationshipMilestones: [
    {
      id: 'rm_1',
      friendId: 'friend_1',
      friendName: 'Sarah',
      type: 'one_year',
      title: '1 Year of Friendship',
      description: "You've been tracking your friendship with Sarah for 1 year!",
      achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      xpReward: 100,
      celebrated: true,
    },
    {
      id: 'rm_2',
      friendId: 'friend_2',
      friendName: 'Mike',
      type: 'interactions_100',
      title: '100 Interactions',
      description: "You've logged 100 interactions with Mike!",
      achievedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      xpReward: 150,
      celebrated: false,
    },
  ],
  garden: defaultGarden,
  leaderboardOptIn: false,
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(defaultState);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({
          ...defaultState,
          ...parsed,
          level: parsed.level || defaultLevel,
          achievements: parsed.achievements || initializeAchievements(),
          weeklyChallenges: parsed.weeklyChallenges || initializeWeeklyChallenges(),
        });
      }
    } catch (error) {
      console.error('Failed to load gamification state:', error);
    }
  };

  const saveState = async (newState: GamificationState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save gamification state:', error);
    }
  };

  const addXP = useCallback((amount: number, source: string) => {
    setState(prev => {
      const newTotalXP = prev.level.totalXP + amount;
      const newLevel = calculateLevel(newTotalXP);
      const newState = {
        ...prev,
        level: newLevel,
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateChallengeProgress = useCallback((challengeId: string, progress: number) => {
    setState(prev => {
      const newChallenges = prev.weeklyChallenges.map(c => {
        if (c.id === challengeId) {
          const newProgress = Math.min(progress, c.target);
          return {
            ...c,
            progress: newProgress,
            isCompleted: newProgress >= c.target,
          };
        }
        return c;
      });
      const newState = { ...prev, weeklyChallenges: newChallenges };
      saveState(newState);
      return newState;
    });
  }, []);

  const completeChallenge = useCallback((challengeId: string) => {
    setState(prev => {
      const challenge = prev.weeklyChallenges.find(c => c.id === challengeId);
      if (!challenge || challenge.isCompleted) return prev;

      const newChallenges = prev.weeklyChallenges.map(c =>
        c.id === challengeId ? { ...c, isCompleted: true, progress: c.target } : c
      );

      const newTotalXP = prev.level.totalXP + challenge.xpReward + XP_PER_ACTION.challenge_complete;
      const newLevel = calculateLevel(newTotalXP);

      const newState = {
        ...prev,
        weeklyChallenges: newChallenges,
        level: newLevel,
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setState(prev => {
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (!achievement || achievement.unlockedAt) return prev;

      const newAchievements = prev.achievements.map(a =>
        a.id === achievementId ? { ...a, unlockedAt: new Date(), progress: a.requirement } : a
      );

      const newTotalXP = prev.level.totalXP + achievement.xpReward + XP_PER_ACTION.achievement_unlock;
      const newLevel = calculateLevel(newTotalXP);

      const newState = {
        ...prev,
        achievements: newAchievements,
        level: newLevel,
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateAchievementProgress = useCallback((achievementId: string, progress: number) => {
    setState(prev => {
      const newAchievements = prev.achievements.map(a => {
        if (a.id === achievementId && !a.unlockedAt) {
          const newProgress = Math.min(progress, a.requirement);
          if (newProgress >= a.requirement) {
            return { ...a, progress: newProgress, unlockedAt: new Date() };
          }
          return { ...a, progress: newProgress };
        }
        return a;
      });

      const justUnlocked = newAchievements.find(
        a => a.id === achievementId && a.unlockedAt && !prev.achievements.find(pa => pa.id === achievementId)?.unlockedAt
      );

      let newLevel = prev.level;
      if (justUnlocked) {
        const newTotalXP = prev.level.totalXP + justUnlocked.xpReward + XP_PER_ACTION.achievement_unlock;
        newLevel = calculateLevel(newTotalXP);
      }

      const newState = {
        ...prev,
        achievements: newAchievements,
        level: newLevel,
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addRelationshipMilestone = useCallback(
    (milestone: Omit<RelationshipMilestone, 'id' | 'achievedAt' | 'celebrated'>) => {
      setState(prev => {
        const newMilestone: RelationshipMilestone = {
          ...milestone,
          id: `rm_${Date.now()}`,
          achievedAt: new Date(),
          celebrated: false,
        };

        const newTotalXP = prev.level.totalXP + milestone.xpReward;
        const newLevel = calculateLevel(newTotalXP);

        const newState = {
          ...prev,
          relationshipMilestones: [...prev.relationshipMilestones, newMilestone],
          level: newLevel,
        };
        saveState(newState);
        return newState;
      });
    },
    []
  );

  const celebrateMilestone = useCallback((milestoneId: string) => {
    setState(prev => {
      const newMilestones = prev.relationshipMilestones.map(m =>
        m.id === milestoneId ? { ...m, celebrated: true } : m
      );
      const newState = { ...prev, relationshipMilestones: newMilestones };
      saveState(newState);
      return newState;
    });
  }, []);

  const toggleLeaderboardOptIn = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, leaderboardOptIn: !prev.leaderboardOptIn };
      saveState(newState);
      return newState;
    });
  }, []);

  const refreshWeeklyChallenges = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, weeklyChallenges: initializeWeeklyChallenges() };
      saveState(newState);
      return newState;
    });
  }, []);

  const waterGarden = useCallback(() => {
    setState(prev => {
      const newPlants = prev.garden.plants.map(p => ({
        ...p,
        lastWatered: new Date(),
        health: Math.min(100, p.health + 10),
      }));
      const newState = {
        ...prev,
        garden: {
          ...prev.garden,
          plants: newPlants,
          gardenHealth: Math.min(100, prev.garden.gardenHealth + 5),
        },
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const getUnlockedAchievements = useCallback(() => {
    return state.achievements.filter(a => a.unlockedAt);
  }, [state.achievements]);

  const getLockedAchievements = useCallback(() => {
    return state.achievements.filter(a => !a.unlockedAt);
  }, [state.achievements]);

  const getActiveSeasonalEvent = useCallback(() => {
    const now = new Date();
    return state.seasonalEvents.find(e => e.isActive && new Date(e.startDate) <= now && new Date(e.endDate) >= now) || null;
  }, [state.seasonalEvents]);

  return (
    <GamificationContext.Provider
      value={{
        state,
        addXP,
        updateChallengeProgress,
        completeChallenge,
        unlockAchievement,
        updateAchievementProgress,
        addRelationshipMilestone,
        celebrateMilestone,
        toggleLeaderboardOptIn,
        refreshWeeklyChallenges,
        waterGarden,
        getUnlockedAchievements,
        getLockedAchievements,
        getActiveSeasonalEvent,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
