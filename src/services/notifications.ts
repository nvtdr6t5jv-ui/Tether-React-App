import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { config } from '../config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'nudge' | 'reminder' | 'achievement' | 'streak' | 'birthday';
  friendId?: string;
  friendName?: string;
  message?: string;
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E07A5F',
      });

      await Notifications.setNotificationChannelAsync('nudges', {
        name: 'Friend Nudges',
        description: 'Reminders to reach out to friends',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#81B29A',
      });

      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements',
        description: 'Achievement unlocks and milestones',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#F2CC8F',
      });
    }

    return true;
  },

  async registerForPushNotifications(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: config.notifications.projectId,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('push_tokens').upsert({
          user_id: user.id,
          token: tokenData.data,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  async scheduleNudge(params: {
    friendId: string;
    friendName: string;
    triggerDate: Date;
    message?: string;
  }): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to reach out to ${params.friendName}`,
        body: params.message || `It's been a while since you connected. Send them a quick message!`,
        data: {
          type: 'nudge',
          friendId: params.friendId,
          friendName: params.friendName,
        } as NotificationData,
        sound: true,
        categoryIdentifier: 'nudge',
      },
      trigger: {
        date: params.triggerDate,
        channelId: 'nudges',
      },
    });

    return identifier;
  },

  async scheduleReminder(params: {
    friendId: string;
    friendName: string;
    triggerDate: Date;
    message: string;
  }): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${params.friendName}`,
        body: params.message,
        data: {
          type: 'reminder',
          friendId: params.friendId,
          friendName: params.friendName,
        } as NotificationData,
        sound: true,
      },
      trigger: {
        date: params.triggerDate,
        channelId: 'default',
      },
    });

    return identifier;
  },

  async scheduleDailyNudge(hour: number, minute: number): Promise<string> {
    await this.cancelDailyNudge();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Connection Check-in',
        body: 'Who will you connect with today? Open Tether to see your suggestions.',
        data: { type: 'nudge' } as NotificationData,
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: 'nudges',
      },
    });

    return identifier;
  },

  async cancelDailyNudge(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      const data = notification.content.data as NotificationData;
      if (data?.type === 'nudge' && !data.friendId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  },

  async scheduleBirthdayReminder(params: {
    friendId: string;
    friendName: string;
    birthday: Date;
    daysBefore: number;
  }): Promise<string> {
    const triggerDate = new Date(params.birthday);
    triggerDate.setDate(triggerDate.getDate() - params.daysBefore);
    triggerDate.setHours(9, 0, 0, 0);

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: params.daysBefore === 0
          ? `It's ${params.friendName}'s birthday!`
          : `${params.friendName}'s birthday is coming up!`,
        body: params.daysBefore === 0
          ? 'Send them birthday wishes!'
          : `Their birthday is in ${params.daysBefore} day${params.daysBefore > 1 ? 's' : ''}. Plan something special!`,
        data: {
          type: 'birthday',
          friendId: params.friendId,
          friendName: params.friendName,
        } as NotificationData,
        sound: true,
      },
      trigger: {
        date: triggerDate,
        channelId: 'default',
      },
    });

    return identifier;
  },

  async showAchievementNotification(title: string, message: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
        data: { type: 'achievement' } as NotificationData,
        sound: true,
      },
      trigger: null,
    });
  },

  async showStreakNotification(streakCount: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${streakCount} Day Streak!`,
        body: streakCount >= 7
          ? 'Amazing! You\'re on fire. Keep the connections going!'
          : 'Great job staying connected! Keep it up!',
        data: { type: 'streak' } as NotificationData,
        sound: true,
      },
      trigger: null,
    });
  },

  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  },

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  },

  async getBadgeCount(): Promise<number> {
    return Notifications.getBadgeCountAsync();
  },

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  },

  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
