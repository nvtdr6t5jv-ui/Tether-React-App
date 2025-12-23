import { useEffect, useCallback } from 'react';
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

      const level = gamificationState?.level ?? 1;
      const xp = gamificationState?.xp ?? 0;
      const xpToNextLevel = level * 100;
      const plantStage = Math.min(5, Math.floor(level / 2) + 1);

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
    if (friends && interactions) {
      syncWidgetData();
    }
  }, [syncWidgetData, friends, interactions]);

  return { syncWidgetData };
};
