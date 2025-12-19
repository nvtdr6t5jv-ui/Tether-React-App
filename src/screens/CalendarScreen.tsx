import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useApp } from '../context/AppContext';
import { CalendarEvent, ORBITS } from '../types';
import { DrawerModal } from '../components/DrawerModal';
import { useCalendarSync } from '../hooks/useCalendarSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type ViewMode = 'month' | 'week' | 'day';

interface CalendarScreenProps {
  onNavigateToProfile?: (friendId: string) => void;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const getEventColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'birthday': return '#EC4899';
    case 'anniversary': return '#8B5CF6';
    case 'meetup': return '#81B29A';
    case 'call': return '#3B82F6';
    case 'reminder': return '#F59E0B';
    default: return '#6366F1';
  }
};

const getEventIcon = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'birthday': return 'cake-variant';
    case 'anniversary': return 'heart';
    case 'meetup': return 'account-group';
    case 'call': return 'phone';
    case 'reminder': return 'bell';
    default: return 'calendar';
  }
};

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onNavigateToProfile }) => {
  const { friends, calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getUpcomingBirthdays } = useApp();
  const { 
    isSyncing, 
    importEventsFromDevice, 
    exportEventToDevice, 
    syncBirthdaysToDevice,
    autoSyncEnabled,
    enableAutoSync,
    disableAutoSync,
    performAutoSync,
    lastSyncDate 
  } = useCalendarSync();

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (autoSyncEnabled) {
      performAutoSync(addCalendarEvent, calendarEvents);
    }

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active' && autoSyncEnabled) {
        performAutoSync(addCalendarEvent, calendarEvents);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [autoSyncEnabled]);

  React.useEffect(() => {
    const checkFirstVisit = async () => {
      const hasVisited = await AsyncStorage.getItem('@tether_calendar_visited');
      if (!hasVisited) {
        setShowFirstVisitModal(true);
        await AsyncStorage.setItem('@tether_calendar_visited', 'true');
      }
    };
    checkFirstVisit();
  }, []);
  
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState<CalendarEvent | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showFirstVisitModal, setShowFirstVisitModal] = useState(false);
  
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('custom');
  const [newEventFriendIds, setNewEventFriendIds] = useState<string[]>([]);
  const [newEventNotes, setNewEventNotes] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const normalizeTitle = (title: string): string => {
    return title.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const isSameEvent = (event1Title: string, event1Date: Date, event2Title: string, event2Date: Date): boolean => {
    const title1 = normalizeTitle(event1Title);
    const title2 = normalizeTitle(event2Title);
    
    const date1 = new Date(event1Date);
    const date2 = new Date(event2Date);
    
    const sameDay = date1.getFullYear() === date2.getFullYear() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getDate() === date2.getDate();
    
    const timeDiff = Math.abs(date1.getTime() - date2.getTime());
    const withinHour = timeDiff < 60 * 60 * 1000;
    
    return title1 === title2 && (sameDay || withinHour);
  };

  const handleImportFromDevice = async () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0);
    
    const events = await importEventsFromDevice(startDate, endDate);
    
    if (events.length === 0) {
      Alert.alert('No Events', 'No events found in your device calendar for this period.');
      return;
    }

    let imported = 0;
    for (const event of events) {
      const exists = calendarEvents.some(e => {
        const existingDate = e.date instanceof Date ? e.date : new Date(e.date);
        return isSameEvent(e.title, existingDate, event.title, event.startDate) ||
               e.id === `imported-${event.id}` ||
               e.id.startsWith(`imported-${event.id}-`);
      });
      
      if (!exists) {
        await addCalendarEvent({
          id: `imported-${event.id}`,
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

    setShowSyncModal(false);
    Alert.alert('Import Complete', `Imported ${imported} new events from your calendar.`);
  };

  const handleExportBirthdays = async () => {
    const friendsWithBirthdays = friends.filter(f => f.birthday);
    
    if (friendsWithBirthdays.length === 0) {
      Alert.alert('No Birthdays', 'None of your contacts have birthdays set.');
      return;
    }

    const synced = await syncBirthdaysToDevice(friendsWithBirthdays);
    setShowSyncModal(false);
    Alert.alert('Export Complete', `Added ${synced} birthday${synced !== 1 ? 's' : ''} to your device calendar.`);
  };

  const handleExportSelectedEvent = async (event: CalendarEvent) => {
    const result = await exportEventToDevice({
      title: event.title,
      startDate: new Date(event.date),
      notes: event.notes,
    });

    if (result) {
      Alert.alert('Exported', 'Event added to your device calendar.');
    } else {
      Alert.alert('Failed', 'Could not export event to calendar.');
    }
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  const allEvents = useMemo(() => {
    const birthdayEvents: CalendarEvent[] = friends
      .filter(f => f.birthday)
      .map(f => {
        const [year, month, day] = f.birthday!.split('-').map(Number);
        const thisYear = currentDate.getFullYear();
        let birthdayDate = new Date(thisYear, month - 1, day);
        if (birthdayDate < new Date()) {
          birthdayDate = new Date(thisYear + 1, month - 1, day);
        }
        return {
          id: `birthday-${f.id}`,
          title: `${f.name}'s Birthday`,
          date: birthdayDate,
          friendId: f.id,
          type: 'birthday' as const,
          isRecurring: true,
          recurringType: 'yearly' as const,
          isCompleted: false,
          createdAt: new Date(),
        };
      });
    
    return [...calendarEvents, ...birthdayEvents];
  }, [calendarEvents, friends, currentDate]);

  const eventsForDate = useCallback((date: Date) => {
    return allEvents.filter(e => isSameDay(new Date(e.date), date));
  }, [allEvents]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate) return;

    const event: CalendarEvent = {
      id: editingEvent ? editingEvent.id : `event-${Date.now()}`,
      title: newEventTitle,
      date: selectedDate,
      friendId: newEventFriendIds.length > 0 ? newEventFriendIds[0] : undefined,
      friendIds: newEventFriendIds.length > 0 ? newEventFriendIds : undefined,
      type: newEventType,
      isRecurring: false,
      notes: newEventNotes,
      location: newEventLocation,
      isCompleted: editingEvent ? editingEvent.isCompleted : false,
      createdAt: editingEvent ? editingEvent.createdAt : new Date(),
    };

    if (editingEvent) {
      await updateCalendarEvent(editingEvent.id, event);
    } else {
      await addCalendarEvent(event);
    }
    resetEventForm();
    setShowAddEvent(false);
  };

  const resetEventForm = () => {
    setNewEventTitle('');
    setNewEventType('custom');
    setNewEventFriendIds([]);
    setNewEventNotes('');
    setNewEventLocation('');
    setFriendSearchQuery('');
    setEditingEvent(null);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventType(event.type);
    setNewEventFriendIds(event.friendIds || (event.friendId ? [event.friendId] : []));
    setNewEventNotes(event.notes || '');
    setNewEventLocation(event.location || '');
    setSelectedDate(new Date(event.date));
    setShowEventDetail(null);
    setShowAddEvent(true);
  };

  const toggleFriendSelection = (friendId: string) => {
    setNewEventFriendIds(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
    setFriendSearchQuery('');
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteCalendarEvent(eventId);
    setShowEventDetail(null);
  };

  const handleToggleComplete = async (event: CalendarEvent) => {
    await updateCalendarEvent(event.id, { isCompleted: !event.isCompleted });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDay, daysInMonth]);

  const renderMonthView = () => (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {DAYS.map(day => (
          <View key={day} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)' }}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={{ width: (width - 32) / 7, height: 56 }} />;
          }

          const date = new Date(year, month, day);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const dayEvents = eventsForDate(date);
          const hasBirthday = dayEvents.some(e => e.type === 'birthday');
          const hasEvents = dayEvents.length > 0;

          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDate(date)}
              style={{
                width: (width - 32) / 7,
                height: 56,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? '#81B29A' : isToday ? 'rgba(129, 178, 154, 0.15)' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: isToday || isSelected ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                    fontSize: 14,
                    color: isSelected ? '#FFF' : isToday ? '#81B29A' : '#3D405B',
                  }}
                >
                  {day}
                </Text>
              </View>
              {hasEvents && (
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <View
                      key={i}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: getEventColor(event.type),
                      }}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const selectedDateEvents = selectedDate ? eventsForDate(selectedDate) : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#3D405B' }}>
            Calendar
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowSyncModal(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#F4F1DE',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#81B29A" />
              ) : (
                <MaterialCommunityIcons name="sync" size={22} color="#3D405B" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedDate(new Date());
                setShowAddEvent(true);
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#81B29A',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#3D405B" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#3D405B' }}>
            {MONTHS[month]} {year}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#3D405B" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          {renderMonthView()}
        </Animated.View>

        {selectedDate && (
          <Animated.View entering={FadeInUp.delay(100).duration(300)} style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddEvent(true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#81B29A" />
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#81B29A' }}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            {selectedDateEvents.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#FFF',
                  padding: 24,
                  borderRadius: 16,
                  alignItems: 'center',
                }}
              >
                <MaterialCommunityIcons name="calendar-blank" size={40} color="rgba(61, 64, 91, 0.2)" />
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.5)', marginTop: 8 }}>
                  No events for this day
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {selectedDateEvents.map((event, index) => (
                  <Animated.View key={event.id} entering={SlideInRight.delay(index * 50).duration(300)}>
                    <TouchableOpacity
                      onPress={() => setShowEventDetail(event)}
                      activeOpacity={0.9}
                      style={{
                        backgroundColor: '#FFF',
                        padding: 16,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        shadowColor: '#3D405B',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.06,
                        shadowRadius: 12,
                        elevation: 3,
                        borderLeftWidth: 4,
                        borderLeftColor: getEventColor(event.type),
                        opacity: event.isCompleted ? 0.6 : 1,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: `${getEventColor(event.type)}15`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MaterialCommunityIcons
                          name={getEventIcon(event.type) as any}
                          size={20}
                          color={getEventColor(event.type)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: 'PlusJakartaSans_700Bold',
                            fontSize: 16,
                            color: '#3D405B',
                            textDecorationLine: event.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {event.title}
                        </Text>
                        {event.friendId && (
                          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                            {friends.find(f => f.id === event.friendId)?.name}
                          </Text>
                        )}
                      </View>
                      {!event.id.startsWith('birthday-') && (
                        <TouchableOpacity
                          onPress={() => handleToggleComplete(event)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            borderWidth: 2,
                            borderColor: event.isCompleted ? '#81B29A' : 'rgba(61, 64, 91, 0.2)',
                            backgroundColor: event.isCompleted ? '#81B29A' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {event.isCompleted && (
                            <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                          )}
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {upcomingBirthdays.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B', marginBottom: 12, paddingHorizontal: 4 }}>
              Upcoming Birthdays
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {upcomingBirthdays.slice(0, 5).map((item, index) => (
                <Animated.View key={item.friend.id} entering={SlideInRight.delay(index * 50).duration(300)}>
                  <TouchableOpacity
                    onPress={() => onNavigateToProfile?.(item.friend.id)}
                    style={{
                      backgroundColor: '#FFF',
                      padding: 16,
                      borderRadius: 16,
                      alignItems: 'center',
                      width: 100,
                      shadowColor: '#3D405B',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.06,
                      shadowRadius: 12,
                      elevation: 3,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#EC4899' }}>
                        {item.friend.initials}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#3D405B' }} numberOfLines={1}>
                      {item.friend.name.split(' ')[0]}
                    </Text>
                    <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: '#EC4899', marginTop: 2 }}>
                      {item.daysUntil === 0 ? 'Today!' : item.daysUntil === 1 ? 'Tomorrow' : `In ${item.daysUntil} days`}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B', marginBottom: 12, paddingHorizontal: 4 }}>
            Suggested Catch-ups
          </Text>
          <View
            style={{
              backgroundColor: '#FFF',
              padding: 16,
              borderRadius: 16,
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            {friends.slice(0, 3).map((friend, index) => {
              const orbit = ORBITS.find(o => o.id === friend.orbitId);
              return (
                <View
                  key={friend.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: index < 2 ? 1 : 0,
                    borderBottomColor: 'rgba(0,0,0,0.05)',
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: orbit?.color || '#81B29A',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#FFF' }}>
                      {friend.initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B' }}>
                      {friend.name}
                    </Text>
                    <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)' }}>
                      Usually {orbit?.id === 'inner' ? 'weekly' : orbit?.id === 'close' ? 'monthly' : 'quarterly'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const suggestedDate = new Date();
                      suggestedDate.setDate(suggestedDate.getDate() + (orbit?.daysInterval || 7));
                      setSelectedDate(suggestedDate);
                      setNewEventTitle(`Catch up with ${friend.name}`);
                      setNewEventType('meetup');
                      setNewEventFriendId(friend.id);
                      setShowAddEvent(true);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: 'rgba(129, 178, 154, 0.1)',
                      borderRadius: 9999,
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#81B29A' }}>
                      Schedule
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      <DrawerModal visible={showAddEvent} onClose={() => { resetEventForm(); setShowAddEvent(false); }} title={editingEvent ? "Edit Event" : "Add Event"}>
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 8 }}>
              Event Title
            </Text>
            <TextInput
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              placeholder="Enter event title..."
              placeholderTextColor="rgba(61, 64, 91, 0.4)"
              style={{
                backgroundColor: '#F4F1DE',
                padding: 16,
                borderRadius: 12,
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 16,
                color: '#3D405B',
              }}
            />
          </View>

          <View>
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 8 }}>
              Event Type
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {(['meetup', 'call', 'reminder', 'custom'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNewEventType(type)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 9999,
                    backgroundColor: newEventType === type ? getEventColor(type) : '#F4F1DE',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 14,
                      color: newEventType === type ? '#FFF' : '#3D405B',
                      textTransform: 'capitalize',
                    }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View>
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 8 }}>
              Link to Friends (Optional)
            </Text>
            
            {newEventFriendIds.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {newEventFriendIds.map(friendId => {
                  const friend = friends.find(f => f.id === friendId);
                  return (
                    <View
                      key={friendId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#81B29A',
                        borderRadius: 9999,
                        paddingLeft: 12,
                        paddingRight: 8,
                        paddingVertical: 6,
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: '#FFF' }}>
                        {friend?.name || 'Friend'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleFriendSelection(friendId)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,255,255,0.8)" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
            
            <TextInput
              value={friendSearchQuery}
              onChangeText={setFriendSearchQuery}
              placeholder="Search friends to add..."
              placeholderTextColor="rgba(61, 64, 91, 0.4)"
              style={{
                backgroundColor: '#FFF',
                padding: 12,
                borderRadius: 12,
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 14,
                color: '#3D405B',
                marginBottom: 8,
              }}
            />
            {friendSearchQuery.length > 0 && (
              <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
                {friends
                  .filter(f => f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) && !newEventFriendIds.includes(f.id))
                  .slice(0, 5)
                  .map(friend => (
                  <TouchableOpacity
                    key={friend.id}
                    onPress={() => toggleFriendSelection(friend.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: '#F4F1DE',
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B' }}>
                      {friend.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View>
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 8 }}>
              Location (Optional)
            </Text>
            <TextInput
              value={newEventLocation}
              onChangeText={setNewEventLocation}
              placeholder="Enter location..."
              placeholderTextColor="rgba(61, 64, 91, 0.4)"
              style={{
                backgroundColor: '#F4F1DE',
                padding: 16,
                borderRadius: 12,
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 16,
                color: '#3D405B',
              }}
            />
          </View>

          <View>
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 8 }}>
              Notes (Optional)
            </Text>
            <TextInput
              value={newEventNotes}
              onChangeText={setNewEventNotes}
              placeholder="Add notes..."
              placeholderTextColor="rgba(61, 64, 91, 0.4)"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: '#F4F1DE',
                padding: 16,
                borderRadius: 12,
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 16,
                color: '#3D405B',
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleAddEvent}
            style={{
              backgroundColor: '#81B29A',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
              {editingEvent ? 'Save Changes' : 'Add Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerModal>

      <DrawerModal
        visible={!!showEventDetail}
        onClose={() => setShowEventDetail(null)}
        title={showEventDetail?.title || ''}
      >
        {showEventDetail && (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${getEventColor(showEventDetail.type)}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons
                  name={getEventIcon(showEventDetail.type) as any}
                  size={24}
                  color={getEventColor(showEventDetail.type)}
                />
              </View>
              <View>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)' }}>
                  {new Date(showEventDetail.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: getEventColor(showEventDetail.type), textTransform: 'capitalize' }}>
                  {showEventDetail.type}
                </Text>
              </View>
            </View>

            {(showEventDetail.friendIds?.length || showEventDetail.friendId) && (
              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B' }}>
                  With
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(showEventDetail.friendIds || (showEventDetail.friendId ? [showEventDetail.friendId] : [])).map(fId => {
                    const friend = friends.find(f => f.id === fId);
                    if (!friend) return null;
                    return (
                      <TouchableOpacity
                        key={fId}
                        onPress={() => {
                          setShowEventDetail(null);
                          onNavigateToProfile?.(fId);
                        }}
                        style={{
                          backgroundColor: '#F4F1DE',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 9999,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <MaterialCommunityIcons name="account" size={16} color="#3D405B" />
                        <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: '#3D405B' }}>
                          {friend.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {showEventDetail.notes && (
              <View>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#3D405B', marginBottom: 8 }}>
                  Notes
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.8)', lineHeight: 20 }}>
                  {showEventDetail.notes}
                </Text>
              </View>
            )}

            {!showEventDetail.id.startsWith('birthday-') && (
              <>
                <TouchableOpacity
                  onPress={() => handleEditEvent(showEventDetail)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: 16,
                    backgroundColor: '#F4F1DE',
                    borderRadius: 12,
                    marginTop: 8,
                  }}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color="#3D405B" />
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                    Edit Event
                  </Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleDeleteEvent(showEventDetail.id)}
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#E07A5F',
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#E07A5F' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleToggleComplete(showEventDetail);
                      setShowEventDetail(null);
                    }}
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                      backgroundColor: showEventDetail.isCompleted ? '#F4F1DE' : '#81B29A',
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: showEventDetail.isCompleted ? '#3D405B' : '#FFF' }}>
                      {showEventDetail.isCompleted ? 'Undo' : 'Complete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => handleExportSelectedEvent(showEventDetail)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 12,
                marginTop: 8,
              }}
            >
              <MaterialCommunityIcons name="export" size={18} color="#81B29A" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#81B29A' }}>
                Export to Device Calendar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </DrawerModal>

      <Modal
        visible={showSyncModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSyncModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSyncModal(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: '#3D405B', marginBottom: 8 }}>
              Calendar Sync
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginBottom: 20 }}>
              Sync events between Tether and your device calendar.
            </Text>

            <TouchableOpacity
              onPress={handleImportFromDevice}
              disabled={isSyncing}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#F4F1DE',
                borderRadius: 12,
                marginBottom: 12,
                gap: 12,
                opacity: isSyncing ? 0.6 : 1,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#81B29A', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="download" size={22} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                  Import from Calendar
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                  Import events from your device calendar
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportBirthdays}
              disabled={isSyncing}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#F4F1DE',
                borderRadius: 12,
                gap: 12,
                opacity: isSyncing ? 0.6 : 1,
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EC4899', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="cake-variant" size={22} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                  Export Birthdays
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                  Add friends' birthdays to your calendar
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ height: 16 }} />
            
            <TouchableOpacity
              onPress={async () => {
                if (autoSyncEnabled) {
                  await disableAutoSync();
                  Alert.alert('Auto Sync Disabled', 'Calendar auto-sync has been turned off.');
                } else {
                  const success = await enableAutoSync();
                  if (success) {
                    Alert.alert('Auto Sync Enabled', 'Your calendar will automatically sync when you open the app.');
                  }
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                backgroundColor: autoSyncEnabled ? 'rgba(129, 178, 154, 0.15)' : '#F4F1DE',
                borderRadius: 12,
                gap: 12,
                borderWidth: autoSyncEnabled ? 1 : 0,
                borderColor: '#81B29A',
              }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: autoSyncEnabled ? '#81B29A' : 'rgba(61, 64, 91, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="sync" size={22} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                  Auto Sync
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                  {autoSyncEnabled ? 'Enabled - syncs on app open' : 'Automatically sync on app open'}
                </Text>
              </View>
              <View style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: autoSyncEnabled ? '#81B29A' : 'rgba(61, 64, 91, 0.2)',
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#FFF',
                  alignSelf: autoSyncEnabled ? 'flex-end' : 'flex-start',
                }} />
              </View>
            </TouchableOpacity>
            
            {lastSyncDate && (
              <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, color: 'rgba(61, 64, 91, 0.5)', textAlign: 'center', marginTop: 12 }}>
                Last synced: {lastSyncDate.toLocaleDateString()} at {lastSyncDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}

            <View style={{ height: 24 }} />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showFirstVisitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFirstVisitModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(129, 178, 154, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MaterialCommunityIcons name="calendar-sync" size={32} color="#81B29A" />
              </View>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#3D405B', textAlign: 'center', marginBottom: 8 }}>
                Sync Your Calendar
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.7)', textAlign: 'center', lineHeight: 20 }}>
                Import events from your device calendar and never miss important dates with friends.
              </Text>
            </View>

            <TouchableOpacity
              onPress={async () => {
                setShowFirstVisitModal(false);
                const success = await enableAutoSync();
                if (success) {
                  await performAutoSync(addCalendarEvent, calendarEvents);
                  Alert.alert('Calendar Synced', 'Your calendar events have been imported.');
                }
              }}
              style={{
                backgroundColor: '#81B29A',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
                Sync Calendar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowFirstVisitModal(false)}
              style={{
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'rgba(61, 64, 91, 0.5)' }}>
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};