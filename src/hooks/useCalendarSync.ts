import { useState, useCallback, useEffect } from 'react';
import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from '../types';

interface DeviceCalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  location?: string;
  calendarId: string;
}

const CALENDAR_SYNC_KEY = '@tether_calendar_auto_sync';
const LAST_SYNC_KEY = '@tether_calendar_last_sync';

export const useCalendarSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [deviceCalendars, setDeviceCalendars] = useState<Calendar.Calendar[]>([]);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);

  useEffect(() => {
    loadSyncSettings();
  }, []);

  const loadSyncSettings = async () => {
    try {
      const autoSync = await AsyncStorage.getItem(CALENDAR_SYNC_KEY);
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      setAutoSyncEnabled(autoSync === 'true');
      if (lastSync) setLastSyncDate(new Date(lastSync));
    } catch (error) {
      console.error('Failed to load calendar sync settings:', error);
    }
  };

  const enableAutoSync = async (): Promise<boolean> => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      await AsyncStorage.setItem(CALENDAR_SYNC_KEY, 'true');
      setAutoSyncEnabled(true);
      return true;
    }
    return false;
  };

  const disableAutoSync = async () => {
    await AsyncStorage.setItem(CALENDAR_SYNC_KEY, 'false');
    setAutoSyncEnabled(false);
  };

  const updateLastSyncDate = async () => {
    const now = new Date();
    await AsyncStorage.setItem(LAST_SYNC_KEY, now.toISOString());
    setLastSyncDate(now);
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  };

  const checkPermissions = async (): Promise<boolean> => {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === 'granted';
  };

  const getCalendars = async (): Promise<Calendar.Calendar[]> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow calendar access to sync your events.');
      return [];
    }
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    setDeviceCalendars(calendars);
    return calendars;
  };

  const importEventsFromDevice = async (
    startDate: Date,
    endDate: Date,
    calendarIds?: string[]
  ): Promise<DeviceCalendarEvent[]> => {
    setIsSyncing(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsSyncing(false);
        return [];
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const ids = calendarIds || calendars.map(c => c.id);

      const events = await Calendar.getEventsAsync(ids, startDate, endDate);

      return events.map(e => ({
        id: e.id,
        title: e.title,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
        notes: e.notes || undefined,
        location: e.location || undefined,
        calendarId: e.calendarId,
      }));
    } catch (error) {
      console.error('Failed to import calendar events:', error);
      return [];
    } finally {
      setIsSyncing(false);
    }
  };

  const exportEventToDevice = async (
    event: {
      title: string;
      startDate: Date;
      endDate?: Date;
      notes?: string;
      location?: string;
    },
    calendarId?: string
  ): Promise<string | null> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      let targetCalendarId = calendarId;

      if (!targetCalendarId) {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(
          c => c.allowsModifications && (c.isPrimary || c.source?.type === 'local')
        );
        
        if (!defaultCalendar) {
          if (Platform.OS === 'ios') {
            const newCalendarId = await Calendar.createCalendarAsync({
              title: 'Tether',
              color: '#81B29A',
              entityType: Calendar.EntityTypes.EVENT,
              sourceId: calendars[0]?.source?.id,
              source: calendars[0]?.source,
              name: 'Tether',
              ownerAccount: 'personal',
              accessLevel: Calendar.CalendarAccessLevel.OWNER,
            });
            targetCalendarId = newCalendarId;
          } else {
            Alert.alert('No Calendar', 'No writable calendar found on your device.');
            return null;
          }
        } else {
          targetCalendarId = defaultCalendar.id;
        }
      }

      const eventId = await Calendar.createEventAsync(targetCalendarId, {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000),
        notes: event.notes,
        location: event.location,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      return eventId;
    } catch (error) {
      console.error('Failed to export event to calendar:', error);
      return null;
    }
  };

  const syncBirthdaysToDevice = async (
    friends: { name: string; birthday: string }[]
  ): Promise<number> => {
    let synced = 0;
    
    for (const friend of friends) {
      if (!friend.birthday) continue;
      
      const [year, month, day] = friend.birthday.split('-').map(Number);
      const thisYear = new Date().getFullYear();
      let birthdayDate = new Date(thisYear, month - 1, day);
      
      if (birthdayDate < new Date()) {
        birthdayDate = new Date(thisYear + 1, month - 1, day);
      }

      const result = await exportEventToDevice({
        title: `${friend.name}'s Birthday`,
        startDate: birthdayDate,
        notes: `Birthday reminder from Tether`,
      });
      
      if (result) synced++;
    }
    
    return synced;
  };

  const normalizeTitle = (title: string): string => {
    return title.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
  };

  const isSameEvent = (event1Title: string, event1Date: Date, event2Title: string, event2Date: Date): boolean => {
    const title1 = normalizeTitle(event1Title);
    const title2 = normalizeTitle(event2Title);
    
    const date1 = new Date(event1Date);
    const date2 = new Date(event2Date);
    
    const sameDay = date1.toDateString() === date2.toDateString();
    
    return title1 === title2 && sameDay;
  };

  const performAutoSync = async (
    addCalendarEvent: (event: CalendarEvent) => Promise<void>,
    existingEvents: CalendarEvent[]
  ): Promise<number> => {
    if (!autoSyncEnabled) return 0;
    
    const hasPermission = await checkPermissions();
    if (!hasPermission) return 0;

    setIsSyncing(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const events = await importEventsFromDevice(startDate, endDate);
      
      let imported = 0;
      for (const event of events) {
        const exists = existingEvents.some(e => {
          if (e.sourceCalendarId === event.calendarId && e.id.includes(event.id)) {
            return true;
          }
          
          const existingDate = e.date instanceof Date ? e.date : new Date(e.date);
          const titleMatch = normalizeTitle(e.title) === normalizeTitle(event.title);
          const sameDay = existingDate.toDateString() === event.startDate.toDateString();
          
          return titleMatch && sameDay;
        });
        
        if (!exists) {
          await addCalendarEvent({
            id: `imported-${event.calendarId}-${event.id}-${Date.now()}`,
            title: event.title,
            date: event.startDate,
            type: 'custom',
            notes: event.notes,
            isRecurring: false,
            isCompleted: false,
            createdAt: new Date(),
            sourceCalendarId: event.calendarId,
          });
          imported++;
        }
      }

      await updateLastSyncDate();
      return imported;
    } catch (error) {
      console.error('Auto sync failed:', error);
      return 0;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    deviceCalendars,
    autoSyncEnabled,
    lastSyncDate,
    requestPermissions,
    checkPermissions,
    getCalendars,
    importEventsFromDevice,
    exportEventToDevice,
    syncBirthdaysToDevice,
    enableAutoSync,
    disableAutoSync,
    performAutoSync,
  };
};
