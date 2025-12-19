import { useState, useCallback } from 'react';
import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';
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

export const useCalendarSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [deviceCalendars, setDeviceCalendars] = useState<Calendar.Calendar[]>([]);

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
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

  return {
    isSyncing,
    deviceCalendars,
    requestPermissions,
    getCalendars,
    importEventsFromDevice,
    exportEventToDevice,
    syncBirthdaysToDevice,
  };
};
