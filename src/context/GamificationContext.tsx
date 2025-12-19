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
const STREAK_KEY = '@tether_daily_streak';

interface StreakData {
  currentStreak: number;
  lastActiveDate: string | null;
  longestStreak: number;
}

interface GamificationContextType {
  state: GamificationState;
  streakData: StreakData;
  recordDailyActivity: () => Promise<boolean>;
  addXP: (amount: number, source: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  completeChallenge: (challengeId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  checkAndUpdateAchievements: (stats: AchievementStats) => void;
  addRelationshipMilestone: (milestone: Omit<RelationshipMilestone, 'id' | 'achievedAt' | 'celebrated'>) => void;
  celebrateMilestone: (milestoneId: string) => void;
  toggleLeaderboardOptIn: () => void;
  refreshWeeklyChallenges: () => void;
  waterGarden: () => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getActiveSeasonalEvent: () => SeasonalEvent | null;
}

interface AchievementStats {
  totalInteractions: number;
  callCount: number;
  textCount: number;
  inPersonCount: number;
  uniquePeopleThisWeek: number;
  reconnections: number;
  currentStreak: number;
  challengesCompleted: number;
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

const defaultStreakData: StreakData = {
  currentStreak: 0,
  lastActiveDate: null,
  longestStreak: 0,
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
    progress: 0,
    isCompleted: false,
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
  relationshipMilestones: [],
  garden: defaultGarden,
  leaderboardOptIn: false,
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const getDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(defaultState);
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);

  useEffect(() => {
    loadState();
    loadStreakData();
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
          achievements: parsed.achievements?.length > 0 ? parsed.achievements : initializeAchievements(),
          weeklyChallenges: parsed.weeklyChallenges?.length > 0 ? parsed.weeklyChallenges : initializeWeeklyChallenges(),
        });
      }
    } catch (error) {
      console.error('Failed to load gamification state:', error);
    }
  };

  const loadStreakData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const lastActive = parsed.lastActiveDate;
        
        if (lastActive) {
          const [lastYear, lastMonth, lastDay] = lastActive.split('-').map(Number);
          const lastDate = new Date(lastYear, lastMonth - 1, lastDay);
          lastDate.setHours(0, 0, 0, 0);
          
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            const resetData = {
              currentStreak: 0,
              lastActiveDate: null,
              longestStreak: parsed.longestStreak || 0,
            };
            setStreakData(resetData);
            await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(resetData));
          } else {
            setStreakData(parsed);
          }
        } else {
          setStreakData(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  };

  const saveState = async (newState: GamificationState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save gamification state:', error);
    }
  };

  const saveStreakData = async (data: StreakData) => {
    try {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save streak data:', error);
    }
  };

  const recordDailyActivity = useCallback(async (): Promise<boolean> => {
    const today = getDateString(new Date());
    
    if (streakData.lastActiveDate === today) {
      return false;
    }
    
    let newStreak = 1;
    
    if (streakData.lastActiveDate) {
      const [lastYear, lastMonth, lastDay] = streakData.lastActiveDate.split('-').map(Number);
      const lastDate = new Date(lastYear, lastMonth - 1, lastDay);
      lastDate.setHours(0, 0, 0, 0);
      
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak = streakData.currentStreak + 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      } else if (diffDays === 0) {
        return false;
      }
    }
    
    const newLongest = Math.max(newStreak, streakData.longestStreak);
    
    const newStreakData: StreakData = {
      currentStreak: newStreak,
      lastActiveDate: today,
      longestStreak: newLongest,
    };
    
    setStreakData(newStreakData);
    await saveStreakData(newStreakData);
    
    const plantStage = getPlantStage(newStreak);
    setState(prev => {
      const newState = {
        ...prev,
        garden: {
          ...prev.garden,
          currentStreak: newStreak,
          plants: prev.garden.plants.map(p => ({
            ...p,
            stage: plantStage,
            icon: plantStage,
          })),
        },
      };
      saveState(newState);
      return newState;
    });
    
    return true;
  }, [streakData]);

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
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (!achievement || achievement.unlockedAt) return prev;

      const newProgress = Math.min(progress, achievement.requirement);
      const shouldUnlock = newProgress >= achievement.requirement;

      const newAchievements = prev.achievements.map(a => {
        if (a.id === achievementId) {
          return {
            ...a,
            progress: newProgress,
            unlockedAt: shouldUnlock ? new Date() : undefined,
          };
        }
        return a;
      });

      let newLevel = prev.level;
      if (shouldUnlock) {
        const newTotalXP = prev.level.totalXP + achievement.xpReward + XP_PER_ACTION.achievement_unlock;
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

  const checkAndUpdateAchievements = useCallback((stats: AchievementStats) => {
    updateAchievementProgress('first_steps', stats.totalInteractions > 0 ? 1 : 0);
    updateAchievementProgress('social_butterfly', stats.uniquePeopleThisWeek);
    updateAchievementProgress('super_connector', stats.uniquePeopleThisWeek);
    
    updateAchievementProgress('streak_starter', stats.currentStreak);
    updateAchievementProgress('week_warrior', stats.currentStreak);
    updateAchievementProgress('consistency_champion', stats.currentStreak);
    updateAchievementProgress('streak_legend', stats.currentStreak);
    updateAchievementProgress('eternal_flame', stats.currentStreak);
    
    updateAchievementProgress('phone_friend', stats.callCount);
    updateAchievementProgress('call_master', stats.callCount);
    updateAchievementProgress('voice_virtuoso', stats.callCount);
    
    updateAchievementProgress('texter', stats.textCount);
    updateAchievementProgress('messenger', stats.textCount);
    updateAchievementProgress('text_titan', stats.textCount);
    
    updateAchievementProgress('face_to_face', stats.inPersonCount);
    updateAchievementProgress('social_star', stats.inPersonCount);
    updateAchievementProgress('gathering_guru', stats.inPersonCount);
    
    updateAchievementProgress('reconnector', stats.reconnections > 0 ? 1 : 0);
    updateAchievementProgress('bridge_builder', stats.reconnections);
    updateAchievementProgress('no_one_forgotten', stats.reconnections);
    
    updateAchievementProgress('centurion', stats.totalInteractions);
    updateAchievementProgress('five_hundred_club', stats.totalInteractions);
    updateAchievementProgress('thousand_touches', stats.totalInteractions);
    
    updateAchievementProgress('challenge_crusher', stats.challengesCompleted);
    updateAchievementProgress('challenge_master', stats.challengesCompleted);
    
    const hour = new Date().getHours();
    if (stats.totalInteractions > 0) {
      if (hour < 9) {
        updateAchievementProgress('early_bird', 1);
      }
      if (hour >= 22) {
        updateAchievementProgress('night_owl', 1);
      }
    }
  }, [updateAchievementProgress]);

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
        streakData,
        recordDailyActivity,
        addXP,
        updateChallengeProgress,
        completeChallenge,
        unlockAchievement,
        updateAchievementProgress,
        checkAndUpdateAchievements,
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
