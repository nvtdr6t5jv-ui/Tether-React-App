import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP_ID = 'group.com.social.tether';
const WIDGET_DATA_KEY = '@tether_widget_data';

export interface WidgetData {
  streak: {
    current: number;
    lastUpdated: string;
  };
  todayFocus: {
    friendName: string;
    friendInitials: string;
    friendPhoto?: string;
    daysSinceContact: number;
    orbitName: string;
  } | null;
  garden: {
    plantStage: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
  };
  stats: {
    connectionsThisWeek: number;
    overdueCount: number;
    upcomingBirthdays: number;
  };
  premium: {
    isPremium: boolean;
    plan?: string;
  };
  lastSynced: string;
}

const defaultWidgetData: WidgetData = {
  streak: {
    current: 0,
    lastUpdated: new Date().toISOString(),
  },
  todayFocus: null,
  garden: {
    plantStage: 1,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
  },
  stats: {
    connectionsThisWeek: 0,
    overdueCount: 0,
    upcomingBirthdays: 0,
  },
  premium: {
    isPremium: false,
  },
  lastSynced: new Date().toISOString(),
};

class WidgetService {
  private widgetData: WidgetData = defaultWidgetData;
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(WIDGET_DATA_KEY);
      if (stored) {
        this.widgetData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to initialize widget data:', error);
    }
  }

  async updateWidgetData(updates: Partial<WidgetData>): Promise<void> {
    try {
      this.widgetData = {
        ...this.widgetData,
        ...updates,
        lastSynced: new Date().toISOString(),
      };

      await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(this.widgetData));

      if (Platform.OS === 'ios') {
        if (this.syncTimeout) {
          clearTimeout(this.syncTimeout);
        }
        this.syncTimeout = setTimeout(() => {
          this.syncToAppGroup();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to update widget data:', error);
    }
  }

  async updateStreak(current: number): Promise<void> {
    await this.updateWidgetData({
      streak: {
        current,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  async updateTodayFocus(focus: WidgetData['todayFocus']): Promise<void> {
    await this.updateWidgetData({ todayFocus: focus });
  }

  async updateGarden(garden: WidgetData['garden']): Promise<void> {
    await this.updateWidgetData({ garden });
  }

  async updateStats(stats: WidgetData['stats']): Promise<void> {
    await this.updateWidgetData({ stats });
  }

  async updatePremiumStatus(isPremium: boolean, plan?: string): Promise<void> {
    await this.updateWidgetData({
      premium: { isPremium, plan },
    });
  }

  private async syncToAppGroup(): Promise<void> {
    try {
      await SharedGroupPreferences.setItem(
        'widgetData',
        this.widgetData,
        APP_GROUP_ID
      );
      console.log('Widget data synced to App Group');
    } catch (error) {
      console.error('Failed to sync to App Group:', error);
    }
  }

  getWidgetData(): WidgetData {
    return this.widgetData;
  }

  async refreshAllWidgets(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await this.syncToAppGroup();
      } catch (error) {
        console.error('Failed to refresh widgets:', error);
      }
    }
  }
}

export const widgetService = new WidgetService();