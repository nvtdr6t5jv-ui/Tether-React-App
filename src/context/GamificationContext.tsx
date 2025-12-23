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
import { api } from '../services/api';
import { supabase } from '../services/supabase';

const STORAGE_KEY = '@tether_gamification';
const STREAK_KEY = '@tether_daily_streak';

const calculateTotalXPFromState = (state: GamificationState): number => {
  const achievementXP = state.achievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => sum + a.xpReward + XP_PER_ACTION.achievement_unlock, 0);
  
  const challengeXP = state.weeklyChallenges
    .filter(c => c.isCompleted)
    .reduce((sum, c) => sum + c.xpReward + XP_PER_ACTION.challenge_complete, 0);
  
  const milestoneXP = state.relationshipMilestones
    .reduce((sum, m) => sum + m.xpReward, 0);
  
  return achievementXP + challengeXP + milestoneXP;
};



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
      let localState = defaultState;
      if (stored) {
        const parsed = JSON.parse(stored);
        
        let challenges = initializeWeeklyChallenges();
        if (parsed.weeklyChallenges?.length > 0) {
          challenges = challenges.map(freshChallenge => {
            const savedChallenge = parsed.weeklyChallenges.find((c: any) => c.id === freshChallenge.id);
            if (savedChallenge) {
              return {
                ...freshChallenge,
                progress: savedChallenge.progress || 0,
                isCompleted: savedChallenge.isCompleted || false,
              };
            }
            return freshChallenge;
          });
        }
        
        let achievements = initializeAchievements();
        if (parsed.achievements?.length > 0) {
          achievements = achievements.map(freshAchievement => {
            const savedAchievement = parsed.achievements.find((a: any) => a.id === freshAchievement.id);
            if (savedAchievement) {
              return {
                ...freshAchievement,
                progress: savedAchievement.progress || 0,
                unlockedAt: savedAchievement.unlockedAt ? new Date(savedAchievement.unlockedAt) : undefined,
              };
            }
            return freshAchievement;
          });
        }
        
        const milestones = (parsed.relationshipMilestones || []).map((m: any) => ({
          ...m,
          achievedAt: m.achievedAt ? new Date(m.achievedAt) : new Date(),
        }));
        
        localState = {
          ...defaultState,
          ...parsed,
          achievements,
          weeklyChallenges: challenges,
          relationshipMilestones: milestones,
        };
        const computedXP = calculateTotalXPFromState(localState);
        localState.level = calculateLevel(computedXP);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const [cloudAchievements, profile] = await Promise.all([
            api.achievements.getUnlocked(),
            api.profiles.get(),
          ]);

          if (cloudAchievements && cloudAchievements.length > 0) {
            const updatedAchievements = localState.achievements.map(a => {
              const cloudA = cloudAchievements.find(ca => ca.achievement_id === a.id);
              if (cloudA && !a.unlockedAt) {
                return { ...a, unlockedAt: new Date(cloudA.unlocked_at), progress: a.requirement };
              }
              return a;
            });
            localState = { ...localState, achievements: updatedAchievements };
          }

          const computedXP = calculateTotalXPFromState(localState);
          localState = { ...localState, level: calculateLevel(computedXP) };
          
          if (profile) {
            const cloudXP = profile.total_xp || 0;
            if (computedXP !== cloudXP) {
              api.profiles.setTotalXP(computedXP).catch(() => {});
            }
          }
        } catch (cloudError) {
          console.log('Could not load from cloud, using local data');
        }
      }

      setState(localState);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
    } catch (error) {
      console.error('Failed to load gamification state:', error);
    }
  };

  const loadStreakData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      let localStreak = defaultStreakData;
      
      if (stored) {
        const parsed = JSON.parse(stored);
        localStreak = parsed;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const profile = await api.profiles.get();
          if (profile && (profile.streak_current > localStreak.currentStreak || profile.streak_longest > localStreak.longestStreak)) {
            localStreak = {
              currentStreak: Math.max(localStreak.currentStreak, profile.streak_current || 0),
              lastActiveDate: localStreak.lastActiveDate,
              longestStreak: Math.max(localStreak.longestStreak, profile.streak_longest || 0),
            };
          }
        } catch (cloudError) {
          console.log('Could not load streak from cloud');
        }
      }

      const lastActive = localStreak.lastActiveDate;
      if (lastActive) {
        const [lastYear, lastMonth, lastDay] = lastActive.split('-').map(Number);
        const lastDate = new Date(lastYear, lastMonth - 1, lastDay);
        lastDate.setHours(0, 0, 0, 0);
        
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          localStreak = {
            currentStreak: 0,
            lastActiveDate: null,
            longestStreak: localStreak.longestStreak,
          };
        }
      }

      setStreakData(localStreak);
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(localStreak));
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  };

  const saveState = async (newState: GamificationState) => {
    try {
      const computedXP = calculateTotalXPFromState(newState);
      const stateWithCorrectXP = {
        ...newState,
        level: calculateLevel(computedXP),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithCorrectXP));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        api.profiles.setTotalXP(computedXP).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to save gamification state:', error);
    }
  };

  const saveStreakData = async (data: StreakData) => {
    try {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await api.profiles.updateStreak(data.currentStreak, data.longestStreak);
        } catch (cloudError) {
          console.log('Could not sync streak to cloud');
        }
      }
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

  const addXP = useCallback(async (amount: number, source: string) => {
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await api.profiles.addXP(amount);
      }
    } catch (error) {
      console.log('Could not sync XP to cloud');
    }
  }, []);

  const updateChallengeProgress = useCallback((challengeIdOrType: string, progressIncrement: number) => {
    setState(prev => {
      const newChallenges = prev.weeklyChallenges.map(c => {
        const matchById = c.id === challengeIdOrType;
        const matchByType = c.type === challengeIdOrType || 
          (challengeIdOrType === 'make_calls' && c.type === 'calls') ||
          (challengeIdOrType === 'send_messages' && c.type === 'messages') ||
          (challengeIdOrType === 'reach_out' && c.type === 'reconnect');
        
        if ((matchById || matchByType) && !c.isCompleted) {
          const newProgress = Math.min(c.progress + progressIncrement, c.target);
          return {
            ...c,
            progress: newProgress,
            isCompleted: newProgress >= c.target,
          };
        }
        return c;
      });
      const newState = { ...prev, weeklyChallenges: newChallenges };
      const computedXP = calculateTotalXPFromState(newState);
      const stateWithCorrectXP = {
        ...newState,
        level: calculateLevel(computedXP),
      };
      saveState(stateWithCorrectXP);
      return stateWithCorrectXP;
    });
  }, []);

  const completeChallenge = useCallback((challengeId: string) => {
    setState(prev => {
      const challenge = prev.weeklyChallenges.find(c => c.id === challengeId);
      if (!challenge || challenge.isCompleted) return prev;

      const newChallenges = prev.weeklyChallenges.map(c =>
        c.id === challengeId ? { ...c, isCompleted: true, progress: c.target } : c
      );

      const newState = {
        ...prev,
        weeklyChallenges: newChallenges,
      };
      const computedXP = calculateTotalXPFromState(newState);
      const stateWithCorrectXP = {
        ...newState,
        level: calculateLevel(computedXP),
      };
      saveState(stateWithCorrectXP);
      return stateWithCorrectXP;
    });
  }, []);

  const unlockAchievement = useCallback(async (achievementId: string) => {
    setState(prev => {
      const achievement = prev.achievements.find(a => a.id === achievementId);
      if (!achievement || achievement.unlockedAt) return prev;

      const newAchievements = prev.achievements.map(a =>
        a.id === achievementId ? { ...a, unlockedAt: new Date(), progress: a.requirement } : a
      );

      const newState = {
        ...prev,
        achievements: newAchievements,
      };
      const computedXP = calculateTotalXPFromState(newState);
      const stateWithCorrectXP = {
        ...newState,
        level: calculateLevel(computedXP),
      };
      saveState(stateWithCorrectXP);
      return stateWithCorrectXP;
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await api.achievements.unlock(achievementId);
      }
    } catch (error) {
      console.log('Could not sync achievement to cloud');
    }
  }, []);

  const updateAchievementProgress = useCallback(async (achievementId: string, progress: number) => {
    let shouldSyncAchievement = false;
    
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

      if (shouldUnlock) {
        shouldSyncAchievement = true;
      }

      const newState = {
        ...prev,
        achievements: newAchievements,
      };
      const computedXP = calculateTotalXPFromState(newState);
      const stateWithCorrectXP = {
        ...newState,
        level: calculateLevel(computedXP),
      };
      saveState(stateWithCorrectXP);
      return stateWithCorrectXP;
    });
    
    if (shouldSyncAchievement) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await api.achievements.unlock(achievementId);
        }
      } catch (error) {
        console.log('Could not sync achievement to cloud');
      }
    }
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

        const newState = {
          ...prev,
          relationshipMilestones: [...prev.relationshipMilestones, newMilestone],
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
