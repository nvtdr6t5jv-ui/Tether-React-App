import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { widgetService } from '../services/widgetService';
import { useApp } from '../context/AppContext';
import { useGamification } from '../context/GamificationContext';

export const useWidgetSync = () => {
  const { 
    friends, 
    interactions, 
    premiumStatus, 
    getSocialHealthStats,
    getOverdueFriends,
  } = useApp();
  const { gamificationState, streakData } = useGamification();
  const appState = useRef(AppState.currentState);

  const syncWidgetData = useCallback(async () => {
    try {
      await widgetService.initialize();

      const currentStreak = streakData?.currentStreak ?? 0;
      await widgetService.updateStreak(currentStreak);

      const overdueFriends = getOverdueFriends?.() ?? [];
      if (overdueFriends.length > 0) {
        const focusFriend = overdueFriends[0];
        const now = new Date();
        const lastContactDate = focusFriend?.lastContact ? new Date(focusFriend.lastContact) : null;
        const daysSinceContact = lastContactDate 
          ? Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        await widgetService.updateTodayFocus({
          friendName: focusFriend?.name ?? 'Someone',
          friendInitials: focusFriend?.initials ?? '?',
          friendPhoto: focusFriend?.photo,
          daysSinceContact,
          orbitName: focusFriend?.orbitId === 'inner' ? 'Favorites' : 
                     focusFriend?.orbitId === 'close' ? 'Friends' : 'Acquaintances',
        });
      } else {
        await widgetService.updateTodayFocus(null);
      }

      const levelData = gamificationState?.level;
      let level = 1;
      let xp = 0;
      let xpToNextLevel = 100;

      if (levelData) {
        if (typeof levelData === 'object') {
          level = levelData.level ?? 1;
          xp = levelData.currentXP ?? levelData.totalXP ?? 0;
          xpToNextLevel = levelData.xpToNextLevel ?? 100;
        } else if (typeof levelData === 'number') {
          level = levelData;
        }
      }

      const plantStage = Math.min(5, Math.floor(level / 2) + 1);

      console.log('Widget Garden Sync:', { level, xp, xpToNextLevel, plantStage, levelData });

      await widgetService.updateGarden({
        plantStage,
        level,
        xp,
        xpToNextLevel,
      });

      const stats = getSocialHealthStats?.() ?? {
        connectionsThisWeek: 0,
        overdueCount: 0,
        upcomingBirthdays: 0,
      };
      
      await widgetService.updateStats({
        connectionsThisWeek: stats.connectionsThisWeek ?? 0,
        overdueCount: stats.overdueCount ?? 0,
        upcomingBirthdays: stats.upcomingBirthdays ?? 0,
      });

      await widgetService.updatePremiumStatus(
        premiumStatus?.isPremium ?? false,
        premiumStatus?.plan
      );

      await widgetService.refreshAllWidgets();
    } catch (error) {
      console.error('Failed to sync widget data:', error);
    }
  }, [friends, interactions, premiumStatus, gamificationState, streakData, getSocialHealthStats, getOverdueFriends]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        syncWidgetData();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [syncWidgetData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncWidgetData();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (friends?.length > 0) {
      syncWidgetData();
    }
  }, [syncWidgetData, friends]);

  useEffect(() => {
    if (interactions?.length > 0) {
      syncWidgetData();
    }
  }, [syncWidgetData, interactions]);

  useEffect(() => {
    if (gamificationState?.level) {
      syncWidgetData();
    }
  }, [gamificationState?.level, syncWidgetData]);

  useEffect(() => {
    if (streakData?.currentStreak !== undefined) {
      syncWidgetData();
    }
  }, [streakData?.currentStreak, syncWidgetData]);

  return { syncWidgetData };
};