import { useState, useEffect, useCallback } from 'react';
import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PermissionType = 'contacts' | 'calendar' | 'notifications';

export interface PermissionStatus {
  contacts: 'granted' | 'denied' | 'undetermined';
  calendar: 'granted' | 'denied' | 'undetermined';
  notifications: 'granted' | 'denied' | 'undetermined';
}

const PERMISSION_ASKED_KEY = '@tether/permissions_asked';

export function usePermissions() {
  const [status, setStatus] = useState<PermissionStatus>({
    contacts: 'undetermined',
    calendar: 'undetermined',
    notifications: 'undetermined',
  });
  const [loading, setLoading] = useState(true);
  const [permissionsAsked, setPermissionsAsked] = useState<Record<PermissionType, boolean>>({
    contacts: false,
    calendar: false,
    notifications: false,
  });

  const checkPermissions = useCallback(async () => {
    try {
      const [contactsStatus, calendarStatus, notificationsStatus, askedData] = await Promise.all([
        Contacts.getPermissionsAsync(),
        Calendar.getCalendarPermissionsAsync(),
        Notifications.getPermissionsAsync(),
        AsyncStorage.getItem(PERMISSION_ASKED_KEY),
      ]);

      setStatus({
        contacts: contactsStatus.granted ? 'granted' : contactsStatus.canAskAgain ? 'undetermined' : 'denied',
        calendar: calendarStatus.granted ? 'granted' : calendarStatus.canAskAgain ? 'undetermined' : 'denied',
        notifications: notificationsStatus.granted ? 'granted' : notificationsStatus.canAskAgain ? 'undetermined' : 'denied',
      });

      if (askedData) {
        setPermissionsAsked(JSON.parse(askedData));
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const markAsked = useCallback(async (permission: PermissionType) => {
    const updated = { ...permissionsAsked, [permission]: true };
    setPermissionsAsked(updated);
    await AsyncStorage.setItem(PERMISSION_ASKED_KEY, JSON.stringify(updated));
  }, [permissionsAsked]);

  const requestContacts = useCallback(async (): Promise<boolean> => {
    try {
      const { status: currentStatus } = await Contacts.getPermissionsAsync();

      if (currentStatus === 'granted') {
        setStatus(prev => ({ ...prev, contacts: 'granted' }));
        return true;
      }

      const { status: newStatus } = await Contacts.requestPermissionsAsync();
      await markAsked('contacts');

      const granted = newStatus === 'granted';
      setStatus(prev => ({ ...prev, contacts: granted ? 'granted' : 'denied' }));
      return granted;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  }, [markAsked]);

  const requestCalendar = useCallback(async (): Promise<boolean> => {
    try {
      const { status: currentStatus } = await Calendar.getCalendarPermissionsAsync();

      if (currentStatus === 'granted') {
        setStatus(prev => ({ ...prev, calendar: 'granted' }));
        return true;
      }

      const { status: newStatus } = await Calendar.requestCalendarPermissionsAsync();
      await markAsked('calendar');

      const granted = newStatus === 'granted';
      setStatus(prev => ({ ...prev, calendar: granted ? 'granted' : 'denied' }));
      return granted;
    } catch (error) {
      console.error('Error requesting calendar permission:', error);
      return false;
    }
  }, [markAsked]);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const { status: currentStatus } = await Notifications.getPermissionsAsync();

      if (currentStatus === 'granted') {
        setStatus(prev => ({ ...prev, notifications: 'granted' }));
        return true;
      }

      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      await markAsked('notifications');

      const granted = newStatus === 'granted';
      setStatus(prev => ({ ...prev, notifications: granted ? 'granted' : 'denied' }));
      return granted;
    } catch (error) {
      console.error('Error requesting notifications permission:', error);
      return false;
    }
  }, [markAsked]);

  const requestPermission = useCallback(async (permission: PermissionType): Promise<boolean> => {
    switch (permission) {
      case 'contacts':
        return requestContacts();
      case 'calendar':
        return requestCalendar();
      case 'notifications':
        return requestNotifications();
      default:
        return false;
    }
  }, [requestContacts, requestCalendar, requestNotifications]);

  const hasPermission = useCallback((permission: PermissionType): boolean => {
    return status[permission] === 'granted';
  }, [status]);

  const canAskPermission = useCallback((permission: PermissionType): boolean => {
    return status[permission] === 'undetermined';
  }, [status]);

  const wasAsked = useCallback((permission: PermissionType): boolean => {
    return permissionsAsked[permission];
  }, [permissionsAsked]);

  return {
    status,
    loading,
    requestPermission,
    requestContacts,
    requestCalendar,
    requestNotifications,
    hasPermission,
    canAskPermission,
    wasAsked,
    refresh: checkPermissions,
  };
}

export async function getContacts(): Promise<Contacts.Contact[]> {
  const { status } = await Contacts.getPermissionsAsync();
  if (status !== 'granted') return [];

  const { data } = await Contacts.getContactsAsync({
    fields: [
      Contacts.Fields.Name,
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Emails,
      Contacts.Fields.Birthday,
      Contacts.Fields.Image,
    ],
    sort: Contacts.SortTypes.FirstName,
  });

  return data.filter(contact => contact.name);
}

export async function getCalendars(): Promise<Calendar.Calendar[]> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status !== 'granted') return [];

  return Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
}

export async function getCalendarEvents(
  calendarIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Calendar.Event[]> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status !== 'granted') return [];

  return Calendar.getEventsAsync(
    calendarIds,
    startDate,
    endDate
  );
}

export async function createCalendarEvent(
  calendarId: string,
  event: {
    title: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
    location?: string;
    allDay?: boolean;
  }
): Promise<string | null> {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  try {
    const eventId = await Calendar.createEventAsync(calendarId, {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      notes: event.notes,
      location: event.location,
      allDay: event.allDay,
    });
    return eventId;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}
