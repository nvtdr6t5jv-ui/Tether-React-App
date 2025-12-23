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
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncData = useRef<string>('');
  const isInitialized = useRef(false);

  const syncWidgetData = useCallback(async (force: boolean = false) => {
    const hasValidStreak = streakData?.currentStreak !== undefined;
    const hasValidGamification = gamificationState?.level !== undefined;
    const hasValidPremium = premiumStatus !== undefined;
    
    if (!force && (!hasValidStreak || !hasValidGamification || !hasValidPremium)) {
      return;
    }

    const currentStreak = streakData?.currentStreak ?? 0;
    
    let level = 1;
    let xp = 0;
    let xpToNextLevel = 100;
    const levelData = gamificationState?.level;

    if (levelData) {
      if (typeof levelData === 'object') {
        level = levelData.level ?? 1;
        xp = levelData.currentXP ?? levelData.totalXP ?? 0;
        xpToNextLevel = levelData.xpToNextLevel ?? 100;
      } else if (typeof levelData === 'number') {
        level = levelData;
      }
    }

    const isPremium = premiumStatus?.isPremium ?? false;
    const plan = premiumStatus?.plan;
    
    const stats = getSocialHealthStats?.() ?? {
      connectionsThisWeek: 0,
      overdueCount: 0,
      upcomingBirthdays: 0,
    };

    const dataHash = JSON.stringify({
      streak: currentStreak,
      level,
      xp,
      isPremium,
      plan,
      stats: stats.connectionsThisWeek + stats.overdueCount + stats.upcomingBirthdays,
      friendCount: friends?.length ?? 0,
    });

    if (!force && dataHash === lastSyncData.current) {
      return;
    }
    lastSyncData.current = dataHash;

    try {
      await widgetService.initialize();

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

      const plantStage = Math.min(5, Math.floor(level / 2) + 1);

      await widgetService.updateGarden({
        plantStage,
        level,
        xp,
        xpToNextLevel,
      });

      await widgetService.updateStats({
        connectionsThisWeek: stats.connectionsThisWeek ?? 0,
        overdueCount: stats.overdueCount ?? 0,
        upcomingBirthdays: stats.upcomingBirthdays ?? 0,
      });

      await widgetService.updatePremiumStatus(isPremium, plan);

      await widgetService.refreshAllWidgets();
      
      isInitialized.current = true;
    } catch (error) {
      console.error('Failed to sync widget data:', error);
    }
  }, [friends, interactions, premiumStatus, gamificationState, streakData, getSocialHealthStats, getOverdueFriends]);

  const debouncedSync = useCallback((force: boolean = false) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      syncWidgetData(force);
    }, 500);
  }, [syncWidgetData]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        debouncedSync(true);
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [debouncedSync]);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSync(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      debouncedSync(false);
    }
  }, [friends?.length, interactions?.length, gamificationState?.level, streakData?.currentStreak, premiumStatus?.isPremium]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return { syncWidgetData: () => debouncedSync(true) };
};
