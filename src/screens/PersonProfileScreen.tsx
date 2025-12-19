import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { useGamification } from '../context/GamificationContext';
import { ORBITS, NOTE_TYPE_CONFIG, INTERACTION_ICONS } from '../types';
import { LogConnectionModal } from '../components/LogConnectionModal';
import { NewNoteModal } from '../components/NewNoteModal';
import { SwipeableScreen } from '../components/SwipeableScreen';

interface PersonProfileScreenProps {
  friendId: string;
  onBack: () => void;
  onEdit: (friendId: string) => void;
  onPremiumRequired?: (trigger: string) => void;
}

const getTimeSince = (date: Date | null): string => {
  if (!date) return 'Never connected';
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

const formatInteractionDate = (date: Date): string => {
  const d = new Date(date);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

export const PersonProfileScreen: React.FC<PersonProfileScreenProps> = ({
  friendId,
  onBack,
  onEdit,
  onPremiumRequired,
}) => {
  const {
    getFriendById,
    getNotesByFriend,
    getInteractionsByFriend,
    getInteractionsByFriendLimited,
    logInteraction,
    deleteNote,
    deleteFriend,
    friends,
    premiumStatus,
    getSmartSuggestion,
    getRelationshipHealth,
    getConversationStarter,
  } = useApp();

  const {
    recordDailyActivity,
    addXP,
    checkAndUpdateAchievements,
    updateChallengeProgress,
    state: gamificationState,
    streakData,
  } = useGamification();

  const allInteractions = useApp().interactions;

  const [showLogModal, setShowLogModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const friend = getFriendById(friendId);
  const notes = useMemo(() => getNotesByFriend(friendId), [friendId, getNotesByFriend]);
  const interactions = useMemo(() => getInteractionsByFriend(friendId), [friendId, getInteractionsByFriend]);
  const orbit = friend ? ORBITS.find(o => o.id === friend.orbitId) : null;

  if (!friend) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 16, color: '#3D405B' }}>
          Friend not found
        </Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: '#E07A5F' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const updateGamificationOnInteraction = useCallback(async (type: string) => {
    await recordDailyActivity();
    
    const xpMap: Record<string, number> = {
      text: 5,
      call: 15,
      video_call: 20,
      in_person: 30,
      meetup: 30,
      other: 5,
    };
    addXP(xpMap[type] || 5, type);
    
    const callCount = allInteractions.filter(i => i.type === 'call').length + (type === 'call' ? 1 : 0);
    const textCount = allInteractions.filter(i => i.type === 'text').length + (type === 'text' ? 1 : 0);
    const inPersonCount = allInteractions.filter(i => i.type === 'in_person' || i.type === 'meetup').length + (type === 'in_person' || type === 'meetup' ? 1 : 0);
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekInteractions = allInteractions.filter(i => new Date(i.date) >= oneWeekAgo);
    const uniquePeople = new Set(weekInteractions.map(i => i.friendId)).size;
    
    const completedChallenges = gamificationState.weeklyChallenges.filter(c => c.isCompleted).length;
    
    checkAndUpdateAchievements({
      totalInteractions: allInteractions.length + 1,
      callCount,
      textCount,
      inPersonCount,
      uniquePeopleThisWeek: uniquePeople,
      reconnections: 0,
      currentStreak: streakData.currentStreak,
      challengesCompleted: completedChallenges,
    });
  }, [recordDailyActivity, addXP, checkAndUpdateAchievements, allInteractions, streakData, gamificationState]);

  const handleCall = async () => {
    if (!friend.phone) {
      Alert.alert('No phone number', 'Add a phone number to call this friend.');
      return;
    }
    if (!premiumStatus.isPremium) {
      onPremiumRequired?.('deep_link');
      return;
    }
    Linking.openURL(`tel:${friend.phone}`);
    await logInteraction(friendId, 'call');
    await updateGamificationOnInteraction('call');
  };

  const handleText = async () => {
    if (!friend.phone) {
      Alert.alert('No phone number', 'Add a phone number to text this friend.');
      return;
    }
    if (!premiumStatus.isPremium) {
      onPremiumRequired?.('deep_link');
      return;
    }
    Linking.openURL(`sms:${friend.phone}`);
    await logInteraction(friendId, 'text');
    await updateGamificationOnInteraction('text');
  };

  const smartSuggestion = getSmartSuggestion(friendId);
  const displayedInteractions = getInteractionsByFriendLimited(friendId);
  const relationshipHealth = getRelationshipHealth(friendId);
  const conversationStarter = getConversationStarter(friendId);

  const handleDelete = () => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.name} from your connections?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteFriend(friendId);
            onBack();
          },
        },
      ]
    );
  };

  return (
    <SwipeableScreen onSwipeBack={onBack}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 }}>
          <TouchableOpacity
            onPress={onBack}
            style={{ padding: 8, marginLeft: -8, borderRadius: 20 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#3D405B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEdit(friendId)}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#E07A5F' }}>Edit</Text>
          </TouchableOpacity>
        </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 8 }}>
          {friend.photo ? (
            <Image
              source={{ uri: friend.photo }}
              style={{
                width: 144,
                height: 144,
                borderRadius: 72,
                borderWidth: 4,
                borderColor: '#FFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              }}
            />
          ) : (
            <View
              style={{
                width: 144,
                height: 144,
                borderRadius: 72,
                backgroundColor: orbit?.color || '#81B29A',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: '#FFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              }}
            >
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 48, color: '#FFF' }}>
                {friend.initials}
              </Text>
            </View>
          )}

          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 32, color: '#3D405B', marginTop: 24, textAlign: 'center' }}>
            {friend.name}
          </Text>

          <View
            style={{
              backgroundColor: orbit?.color || '#E07A5F',
              paddingHorizontal: 20,
              paddingVertical: 6,
              borderRadius: 9999,
              marginTop: 12,
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF', letterSpacing: 0.5 }}>
              {orbit?.name || 'Unknown'}
            </Text>
          </View>

          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginTop: 16 }}>
            Last spoken: {getTimeSince(friend.lastContact)}.
          </Text>
        </Animated.View>

        {smartSuggestion && premiumStatus.isPremium && (
          <Animated.View entering={FadeIn.delay(150).duration(400)} style={{ marginTop: 24, paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(129, 178, 154, 0.1)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9999 }}>
              <MaterialCommunityIcons name="lightbulb" size={16} color="#81B29A" />
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#81B29A' }}>
                {smartSuggestion}
              </Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={{ flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: smartSuggestion && premiumStatus.isPremium ? 24 : 40, paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={handleCall} style={{ alignItems: 'center', gap: 12 }}>
            <View style={{ position: 'relative' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#81B29A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#81B29A',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <MaterialCommunityIcons name="phone" size={28} color="#FFF" />
              </View>
              {!premiumStatus.isPremium && (
                <View style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#E07A5F', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="lock" size={10} color="#FFF" />
                </View>
              )}
            </View>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#3D405B' }}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleText} style={{ alignItems: 'center', gap: 12 }}>
            <View style={{ position: 'relative' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#E07A5F',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#E07A5F',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <MaterialCommunityIcons name="chat" size={28} color="#FFF" />
              </View>
              {!premiumStatus.isPremium && (
                <View style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#3D405B', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="lock" size={10} color="#FFF" />
                </View>
              )}
            </View>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#3D405B' }}>Text</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowLogModal(true)} style={{ alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: 'rgba(61, 64, 91, 0.1)',
              }}
            >
              <MaterialCommunityIcons name="plus" size={28} color="rgba(61, 64, 91, 0.4)" />
            </View>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#3D405B' }}>Log</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(400)} style={{ alignItems: 'center', marginTop: 24, paddingHorizontal: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFF',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: 'rgba(61, 64, 91, 0.05)',
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="cake-variant" size={14} color="#E07A5F" />
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#3D405B' }}>
              Birthday: {formatDate(friend.birthday)}
            </Text>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(61, 64, 91, 0.2)' }} />
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#3D405B' }}>
              Orbit: {orbit?.frequency || 'Unknown'}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(500)} style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <View
            style={{
              backgroundColor: '#FFF',
              padding: 20,
              borderRadius: 20,
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                Relationship Health
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: relationshipHealth.trend === 'improving' ? 'rgba(129, 178, 154, 0.1)' : relationshipHealth.trend === 'declining' ? 'rgba(224, 122, 95, 0.1)' : 'rgba(61, 64, 91, 0.1)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 9999,
                }}
              >
                <MaterialCommunityIcons
                  name={relationshipHealth.trend === 'improving' ? 'trending-up' : relationshipHealth.trend === 'declining' ? 'trending-down' : 'minus'}
                  size={14}
                  color={relationshipHealth.trend === 'improving' ? '#81B29A' : relationshipHealth.trend === 'declining' ? '#E07A5F' : 'rgba(61, 64, 91, 0.6)'}
                />
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                    fontSize: 11,
                    color: relationshipHealth.trend === 'improving' ? '#81B29A' : relationshipHealth.trend === 'declining' ? '#E07A5F' : 'rgba(61, 64, 91, 0.6)',
                    textTransform: 'capitalize',
                  }}
                >
                  {relationshipHealth.trend}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: relationshipHealth.score >= 70 ? 'rgba(129, 178, 154, 0.1)' : relationshipHealth.score >= 40 ? 'rgba(249, 115, 22, 0.1)' : 'rgba(224, 122, 95, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Fraunces_600SemiBold',
                    fontSize: 24,
                    color: relationshipHealth.score >= 70 ? '#81B29A' : relationshipHealth.score >= 40 ? '#F97316' : '#E07A5F',
                  }}
                >
                  {relationshipHealth.score}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ height: 8, backgroundColor: '#F4F1DE', borderRadius: 4, overflow: 'hidden' }}>
                  <View
                    style={{
                      height: '100%',
                      width: `${relationshipHealth.score}%`,
                      backgroundColor: relationshipHealth.score >= 70 ? '#81B29A' : relationshipHealth.score >= 40 ? '#F97316' : '#E07A5F',
                      borderRadius: 4,
                    }}
                  />
                </View>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                  {relationshipHealth.lastInteractionDays === 999 ? 'Never connected' : relationshipHealth.lastInteractionDays === 0 ? 'Connected today' : `${relationshipHealth.lastInteractionDays} days since last contact`}
                </Text>
              </View>
            </View>

            {relationshipHealth.suggestions.length > 0 && (
              <View style={{ marginTop: 12, gap: 6 }}>
                {relationshipHealth.suggestions.slice(0, 2).map((suggestion, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={14} color="#F97316" />
                    <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.7)', flex: 1 }}>
                      {suggestion}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(380).duration(500)} style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <View
            style={{
              backgroundColor: '#F4F1DE',
              padding: 16,
              borderRadius: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#81B29A',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Conversation Starter
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: '#3D405B', fontStyle: 'italic', lineHeight: 20 }}>
              "{conversationStarter}"
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={{ paddingHorizontal: 24, marginTop: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#3D405B' }}>
              Notes & Memories
            </Text>
            <TouchableOpacity
              onPress={() => setShowNoteModal(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#E07A5F" />
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#E07A5F' }}>Add Note</Text>
            </TouchableOpacity>
          </View>

          {notes.length === 0 ? (
            <View
              style={{
                backgroundColor: '#FFF',
                padding: 24,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons name="note-text-outline" size={40} color="rgba(61, 64, 91, 0.2)" />
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginTop: 12 }}>
                No notes yet. Add your first!
              </Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {notes.map((note, index) => {
                const config = NOTE_TYPE_CONFIG[note.type];
                return (
                  <Animated.View
                    key={note.id}
                    entering={SlideInRight.delay(index * 100).duration(300)}
                  >
                    <TouchableOpacity
                      activeOpacity={0.95}
                      onLongPress={() => {
                        Alert.alert('Delete Note', 'Are you sure?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteNote(note.id) },
                        ]);
                      }}
                      style={{
                        backgroundColor: config.bgColor,
                        padding: 20,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 16,
                        borderWidth: note.type === 'draft' ? 1 : 0,
                        borderColor: 'rgba(233, 196, 106, 0.3)',
                      }}
                    >
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
                        <MaterialCommunityIcons
                          name={note.type === 'gift_idea' ? 'gift' : note.type === 'life_update' ? 'briefcase' : note.type === 'draft' ? 'note-text' : 'archive'}
                          size={20}
                          color={config.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B', marginBottom: 4 }}>
                          {config.label}
                        </Text>
                        <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.8)', lineHeight: 20 }}>
                          {note.content}
                        </Text>
                      </View>
                      {note.type === 'draft' && (
                        <TouchableOpacity
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <MaterialCommunityIcons name="send" size={16} color="#3D405B" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(500)} style={{ paddingHorizontal: 24, marginTop: 32 }}>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#3D405B', marginBottom: 16 }}>
            Recent History
          </Text>

          {displayedInteractions.length === 0 ? (
            <View
              style={{
                backgroundColor: '#FFF',
                padding: 24,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons name="history" size={40} color="rgba(61, 64, 91, 0.2)" />
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginTop: 12 }}>
                No interactions logged yet.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {displayedInteractions.slice(0, 5).map((interaction, index) => (
                <Animated.View
                  key={interaction.id}
                  entering={SlideInRight.delay(index * 50).duration(300)}
                  style={{
                    backgroundColor: '#FFF',
                    padding: 16,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={
                        interaction.type === 'call' ? 'phone' :
                        interaction.type === 'text' ? 'chat' :
                        interaction.type === 'video_call' ? 'video' :
                        interaction.type === 'in_person' ? 'coffee' :
                        'dots-horizontal'
                      }
                      size={18}
                      color="rgba(61, 64, 91, 0.4)"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
                      {interaction.type === 'call' ? 'Called' :
                       interaction.type === 'text' ? 'Texted' :
                       interaction.type === 'video_call' ? 'Video call' :
                       interaction.type === 'in_person' ? 'Met in person' :
                       'Connected'}
                    </Text>
                    <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                      {formatInteractionDate(interaction.date)}
                    </Text>
                  </View>
                </Animated.View>
              ))}
              {!premiumStatus.isPremium && interactions.length > displayedInteractions.length && (
                <TouchableOpacity 
                  onPress={() => onPremiumRequired?.('history')}
                  style={{
                    backgroundColor: 'rgba(129, 178, 154, 0.1)',
                    padding: 16,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <MaterialCommunityIcons name="lock" size={16} color="#81B29A" />
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#81B29A' }}>
                    Unlock full history
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600).duration(400)} style={{ paddingHorizontal: 24, marginTop: 40, alignItems: 'center' }}>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#E07A5F' }}>
              Remove from My Universe
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <LogConnectionModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        friends={friends}
        onLogConnection={async (fId, type, note) => {
          await logInteraction(fId, type as any, note);
          await updateGamificationOnInteraction(type);
          setShowLogModal(false);
        }}
        preselectedFriendId={friendId}
      />

      <NewNoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        friendId={friendId}
        friendName={friend.name}
        friendPhoto={friend.photo}
        friendInitials={friend.initials}
      />
      </SafeAreaView>
    </SwipeableScreen>
  );
};
