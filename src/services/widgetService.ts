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
  private widgetData: WidgetData = { ...defaultWidgetData };
  private pendingSync: boolean = false;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(WIDGET_DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.widgetData = {
          ...defaultWidgetData,
          ...parsed,
          garden: { ...defaultWidgetData.garden, ...parsed.garden },
          streak: { ...defaultWidgetData.streak, ...parsed.streak },
          stats: { ...defaultWidgetData.stats, ...parsed.stats },
          premium: { ...defaultWidgetData.premium, ...parsed.premium },
        };
      }
    } catch (error) {
      console.error('Failed to initialize widget data:', error);
    }
  }

  private async saveAndSync(): Promise<void> {
    try {
      this.widgetData.lastSynced = new Date().toISOString();
      await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(this.widgetData));

      if (Platform.OS === 'ios') {
        await this.syncToAppGroup();
      }
    } catch (error) {
      console.error('Failed to save widget data:', error);
    }
  }

  private schedulSync(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }
    this.syncTimer = setTimeout(() => {
      this.saveAndSync();
    }, 100);
  }

  async updateStreak(current: number): Promise<void> {
    this.widgetData.streak = {
      current,
      lastUpdated: new Date().toISOString(),
    };
    this.schedulSync();
  }

  async updateTodayFocus(focus: WidgetData['todayFocus']): Promise<void> {
    this.widgetData.todayFocus = focus;
    this.schedulSync();
  }

  async updateGarden(garden: WidgetData['garden']): Promise<void> {
    this.widgetData.garden = {
      plantStage: garden.plantStage ?? 1,
      level: garden.level ?? 1,
      xp: garden.xp ?? 0,
      xpToNextLevel: garden.xpToNextLevel ?? 100,
    };
    console.log('Garden updated in widget service:', this.widgetData.garden);
    this.schedulSync();
  }

  async updateStats(stats: WidgetData['stats']): Promise<void> {
    this.widgetData.stats = {
      connectionsThisWeek: stats.connectionsThisWeek ?? 0,
      overdueCount: stats.overdueCount ?? 0,
      upcomingBirthdays: stats.upcomingBirthdays ?? 0,
    };
    this.schedulSync();
  }

  async updatePremiumStatus(isPremium: boolean, plan?: string): Promise<void> {
    this.widgetData.premium = { isPremium, plan };
    this.schedulSync();
  }

  private async syncToAppGroup(): Promise<void> {
    try {
      console.log('Syncing to App Group:', JSON.stringify(this.widgetData, null, 2));
      await SharedGroupPreferences.setItem(
        'widgetData',
        this.widgetData,
        APP_GROUP_ID
      );
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
        await this.saveAndSync();
      } catch (error) {
        console.error('Failed to refresh widgets:', error);
      }
    }
  }
}

export const widgetService = new WidgetService();