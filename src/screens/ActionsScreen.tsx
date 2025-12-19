import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { ORBITS, InteractionType } from '../types';

type TabType = 'nudges' | 'drafts' | 'history';

interface ActionsScreenProps {
  onNavigateToProfile: (friendId: string) => void;
  onNavigateToNewNote: () => void;
}

const formatDate = (date: Date): { day: number; isToday: boolean } => {
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return { day: d.getDate(), isToday };
};

const groupInteractionsByMonth = (interactions: any[]) => {
  const groups: { [key: string]: any[] } = {};
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  interactions.forEach(interaction => {
    const date = new Date(interaction.date);
    const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(interaction);
  });
  
  return Object.entries(groups).map(([month, items]) => ({ month, items }));
};

const getInteractionIcon = (type: InteractionType): string => {
  switch (type) {
    case 'call': return 'phone';
    case 'text': return 'chat';
    case 'video_call': return 'video';
    case 'in_person': return 'coffee';
    case 'email': return 'email';
    default: return 'dots-horizontal';
  }
};

const getInteractionLabel = (type: InteractionType, friendName: string): string => {
  switch (type) {
    case 'call': return `Call with ${friendName}`;
    case 'text': return `Texted ${friendName}`;
    case 'video_call': return `Video call with ${friendName}`;
    case 'in_person': return `Met ${friendName}`;
    case 'email': return `Emailed ${friendName}`;
    default: return `Connected with ${friendName}`;
  }
};

export const ActionsScreen: React.FC<ActionsScreenProps> = ({
  onNavigateToProfile,
  onNavigateToNewNote,
}) => {
  const {
    friends,
    drafts,
    interactions,
    getOverdueFriends,
    logInteraction,
    deleteDraft,
    sendDraft,
    getFriendById,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('nudges');

  const overdueFriends = useMemo(() => getOverdueFriends(), [getOverdueFriends, friends]);
  
  const upcomingNudges = useMemo(() => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return friends.filter(f => {
      if (!f.nextNudge) return false;
      const nudgeDate = new Date(f.nextNudge);
      return nudgeDate > now && nudgeDate <= oneWeekLater;
    });
  }, [friends]);

  const completedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return interactions.filter(i => new Date(i.date) >= today);
  }, [interactions]);

  const groupedHistory = useMemo(() => {
    const sorted = [...interactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return groupInteractionsByMonth(sorted.slice(0, 50));
  }, [interactions]);

  const totalMissions = overdueFriends.length + upcomingNudges.length;
  const completedMissions = completedToday.length;
  const progressPercentage = totalMissions > 0 
    ? Math.min((completedMissions / Math.max(totalMissions, 5)) * 100, 100) 
    : 0;

  const handleCall = (friendId: string, phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
      logInteraction(friendId, 'call');
    } else {
      Alert.alert('No phone number', 'Add a phone number to call this friend.');
    }
  };

  const handleText = (friendId: string, phone?: string) => {
    if (phone) {
      Linking.openURL(`sms:${phone}`);
      logInteraction(friendId, 'text');
    } else {
      Alert.alert('No phone number', 'Add a phone number to text this friend.');
    }
  };

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'nudges', label: 'Nudges', count: overdueFriends.length + upcomingNudges.length },
    { key: 'drafts', label: 'Drafts', count: drafts.length },
    { key: 'history', label: 'History' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#3D405B', marginBottom: 20 }}>
          Action Center
        </Text>

        <View style={{ backgroundColor: 'rgba(0,0,0,0.04)', padding: 4, borderRadius: 16, flexDirection: 'row', gap: 4 }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: activeTab === tab.key ? '#E07A5F' : 'transparent',
                shadowColor: activeTab === tab.key ? '#E07A5F' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeTab === tab.key ? 0.2 : 0,
                shadowRadius: 4,
                elevation: activeTab === tab.key ? 2 : 0,
              }}
            >
              <Text
                style={{
                  fontFamily: activeTab === tab.key ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                  fontSize: 14,
                  color: activeTab === tab.key ? '#FFF' : 'rgba(61, 64, 91, 0.6)',
                  textAlign: 'center',
                }}
              >
                {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {activeTab === 'nudges' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={{ marginTop: 8, marginBottom: 16 }}>
            <View
              style={{
                backgroundColor: '#FFF',
                padding: 20,
                borderRadius: 16,
                shadowColor: '#3D405B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#81B29A' }}>
                    {completedMissions} of {Math.max(totalMissions, 5)} Missions Complete.
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(129, 178, 154, 0.9)' }}>
                    Keep the streak alive!
                  </Text>
                </View>
                <MaterialCommunityIcons name="fire" size={24} color="#81B29A" />
              </View>
              <View style={{ height: 10, backgroundColor: '#F4F1DE', borderRadius: 5, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${progressPercentage}%`,
                    backgroundColor: '#81B29A',
                    borderRadius: 5,
                  }}
                />
              </View>
            </View>
          </Animated.View>

          {overdueFriends.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 4 }}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#E07A5F" />
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#E07A5F', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Overdue ({overdueFriends.length})
                </Text>
              </View>
              <View style={{ gap: 12 }}>
                {overdueFriends.map((friend, index) => {
                  const orbit = ORBITS.find(o => o.id === friend.orbitId);
                  const daysSince = friend.lastContact 
                    ? Math.floor((Date.now() - new Date(friend.lastContact).getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <Animated.View
                      key={friend.id}
                      entering={SlideInRight.delay(index * 50).duration(300)}
                      layout={Layout.springify()}
                    >
                      <TouchableOpacity
                        onPress={() => onNavigateToProfile(friend.id)}
                        activeOpacity={0.95}
                        style={{
                          backgroundColor: '#FFF',
                          padding: 16,
                          borderRadius: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 16,
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
                            backgroundColor: orbit?.id === 'inner' ? 'rgba(129, 178, 154, 0.1)' : 'rgba(224, 122, 95, 0.1)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MaterialCommunityIcons
                            name={orbit?.id === 'inner' ? 'phone' : 'chat'}
                            size={24}
                            color={orbit?.id === 'inner' ? '#81B29A' : '#E07A5F'}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B', marginBottom: 2 }}>
                            {orbit?.id === 'inner' ? 'Call' : 'Text'} {friend.name}
                          </Text>
                          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)' }}>
                            {daysSince !== null 
                              ? daysSince < 7 ? `${daysSince} days overdue.` : `${Math.floor(daysSince / 7)} weeks overdue.`
                              : 'Never connected.'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => orbit?.id === 'inner' ? handleCall(friend.id, friend.phone) : handleText(friend.id, friend.phone)}
                          style={{
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            backgroundColor: orbit?.id === 'inner' ? '#81B29A' : '#E07A5F',
                            borderRadius: 9999,
                          }}
                        >
                          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
                            {orbit?.id === 'inner' ? 'Call' : 'Text'}
                          </Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          )}

          {upcomingNudges.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 4 }}>
                <MaterialCommunityIcons name="calendar" size={16} color="#81B29A" />
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#81B29A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  This Week
                </Text>
              </View>
              <View style={{ gap: 12 }}>
                {upcomingNudges.map((friend, index) => (
                  <Animated.View
                    key={friend.id}
                    entering={SlideInRight.delay(index * 50 + 200).duration(300)}
                    layout={Layout.springify()}
                  >
                    <TouchableOpacity
                      onPress={() => onNavigateToProfile(friend.id)}
                      activeOpacity={0.95}
                      style={{
                        backgroundColor: '#FFF',
                        padding: 16,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 16,
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
                          backgroundColor: '#F4F1DE',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: 'rgba(61, 64, 91, 0.05)',
                        }}
                      >
                        <MaterialCommunityIcons name="calendar-check" size={24} color="#3D405B" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B', marginBottom: 2 }}>
                          Catch up with {friend.name}
                        </Text>
                        <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)' }}>
                          Coming up this week.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          backgroundColor: 'rgba(129, 178, 154, 0.2)',
                          borderRadius: 9999,
                        }}
                      >
                        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#81B29A' }}>
                          Plan
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {completedToday.length > 0 && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 4 }}>
                <MaterialCommunityIcons name="check-circle" size={16} color="rgba(61, 64, 91, 0.4)" />
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Completed
                </Text>
              </View>
              <View style={{ gap: 12 }}>
                {completedToday.map((interaction, index) => {
                  const friend = getFriendById(interaction.friendId);
                  if (!friend) return null;

                  return (
                    <Animated.View
                      key={interaction.id}
                      entering={FadeIn.delay(index * 50 + 400).duration(300)}
                    >
                      <View
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          padding: 16,
                          borderRadius: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 16,
                          borderWidth: 1,
                          borderColor: 'rgba(0,0,0,0.05)',
                          opacity: 0.7,
                        }}
                      >
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MaterialCommunityIcons name="check" size={24} color="rgba(61, 64, 91, 0.4)" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontFamily: 'PlusJakartaSans_700Bold',
                              fontSize: 16,
                              color: 'rgba(61, 64, 91, 0.8)',
                              textDecorationLine: 'line-through',
                              textDecorationColor: 'rgba(61, 64, 91, 0.4)',
                            }}
                          >
                            {getInteractionLabel(interaction.type, friend.name)}
                          </Text>
                          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.5)' }}>
                            Done at {new Date(interaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          )}

          {overdueFriends.length === 0 && upcomingNudges.length === 0 && completedToday.length === 0 && (
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={{
                backgroundColor: '#FFF',
                padding: 32,
                borderRadius: 20,
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={48} color="#81B29A" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B', marginTop: 16 }}>
                All caught up!
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginTop: 4, textAlign: 'center' }}>
                No pending actions. Great job staying connected!
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      )}

      {activeTab === 'drafts' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {drafts.length === 0 ? (
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={{
                backgroundColor: '#FFF',
                padding: 32,
                borderRadius: 20,
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons name="note-text-outline" size={48} color="rgba(61, 64, 91, 0.3)" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B', marginTop: 16 }}>
                No drafts yet
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginTop: 4, textAlign: 'center' }}>
                Save message drafts to send later.
              </Text>
            </Animated.View>
          ) : (
            <View style={{ gap: 12 }}>
              {drafts.map((draft, index) => {
                const friend = getFriendById(draft.friendId);
                if (!friend) return null;

                return (
                  <Animated.View
                    key={draft.id}
                    entering={SlideInRight.delay(index * 50).duration(300)}
                  >
                    <View
                      style={{
                        backgroundColor: 'rgba(233, 196, 106, 0.2)',
                        padding: 20,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(233, 196, 106, 0.3)',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MaterialCommunityIcons name="note-text" size={20} color="#E9C46A" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
                            Draft for {friend.name}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.8)', lineHeight: 20, marginBottom: 16 }}>
                        {draft.content}
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert('Delete Draft', 'Are you sure?', [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteDraft(draft.id) },
                            ]);
                          }}
                        >
                          <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'rgba(61, 64, 91, 0.5)' }}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => sendDraft(draft.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            backgroundColor: '#E9C46A',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 9999,
                          }}
                        >
                          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
                            Send
                          </Text>
                          <MaterialCommunityIcons name="send" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'history' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {groupedHistory.length === 0 ? (
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              style={{
                backgroundColor: '#FFF',
                padding: 32,
                borderRadius: 20,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <MaterialCommunityIcons name="history" size={48} color="rgba(61, 64, 91, 0.3)" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B', marginTop: 16 }}>
                No history yet
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginTop: 4, textAlign: 'center' }}>
                Your connection history will appear here.
              </Text>
            </Animated.View>
          ) : (
            groupedHistory.map((group, groupIndex) => (
              <View key={group.month} style={{ marginBottom: 24 }}>
                <View
                  style={{
                    backgroundColor: 'rgba(244, 241, 222, 0.5)',
                    paddingVertical: 12,
                    paddingLeft: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: 'rgba(61, 64, 91, 0.5)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {group.month.split(' ')[0]}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#FFF',
                    borderRadius: 16,
                    overflow: 'hidden',
                    shadowColor: '#3D405B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 3,
                  }}
                >
                  {group.items.map((interaction, index) => {
                    const friend = getFriendById(interaction.friendId);
                    if (!friend) return null;
                    const dateInfo = formatDate(interaction.date);

                    return (
                      <Animated.View
                        key={interaction.id}
                        entering={FadeInRight.delay(groupIndex * 100 + index * 50).duration(300)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 16,
                          borderBottomWidth: index < group.items.length - 1 ? 1 : 0,
                          borderBottomColor: 'rgba(0,0,0,0.05)',
                        }}
                      >
                        <View style={{ width: 48, alignItems: 'center', marginRight: 8 }}>
                          <Text
                            style={{
                              fontFamily: dateInfo.isToday ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                              fontSize: 24,
                              color: dateInfo.isToday ? '#3D405B' : 'rgba(61, 64, 91, 0.4)',
                            }}
                          >
                            {dateInfo.day}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(129, 178, 154, 0.1)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <MaterialCommunityIcons
                            name={getInteractionIcon(interaction.type) as any}
                            size={18}
                            color="#81B29A"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                            {getInteractionLabel(interaction.type, friend.name)}
                          </Text>
                          {interaction.note && (
                            <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)' }} numberOfLines={1}>
                              {interaction.note}
                            </Text>
                          )}
                        </View>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={onNavigateToNewNote}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#81B29A',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#81B29A',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
