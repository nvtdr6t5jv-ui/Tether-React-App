import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useApp, Friend } from '../context/AppContext';
import { useGamification } from '../context/GamificationContext';
import { ORBITS } from '../types';

type FilterType = 'all' | 'overdue' | 'favorites' | 'inner' | 'close' | 'catchup';
type SortType = 'name' | 'lastContact' | 'orbit' | 'recentlyAdded';

interface PeopleScreenProps {
  onNavigateToProfile: (friendId: string) => void;
  onNavigateToNewConnection: () => void;
  onPremiumRequired?: () => void;
}

const getTimeSince = (date: Date | null): { text: string; color: string; percentage: number } => {
  if (!date) return { text: 'Never', color: '#E07A5F', percentage: 0 };
  
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return { text: 'Today', color: '#81B29A', percentage: 100 };
  if (days === 1) return { text: '1d ago', color: '#81B29A', percentage: 95 };
  if (days < 7) return { text: `${days}d ago`, color: '#81B29A', percentage: 90 - days * 5 };
  if (days < 14) return { text: `1w ago`, color: '#81B29A', percentage: 70 };
  if (days < 30) return { text: `${Math.floor(days / 7)}w ago`, color: '#E9C46A', percentage: 60 };
  if (days < 90) return { text: `${Math.floor(days / 30)}mo ago`, color: '#E07A5F', percentage: 25 };
  return { text: `${Math.floor(days / 30)}mo ago`, color: '#E07A5F', percentage: 15 };
};

const FriendCard: React.FC<{
  friend: Friend;
  index: number;
  onPress: () => void;
  isOverdue: boolean;
  onSwipeCall?: () => void;
  onSwipeText?: () => void;
  onMenuPress?: () => void;
}> = ({ friend, index, onPress, isOverdue, onSwipeCall, onSwipeText, onMenuPress }) => {
  const timeInfo = getTimeSince(friend.lastContact);
  const orbit = ORBITS.find(o => o.id === friend.orbitId);
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .minDistance(15)
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, 120);
      }
    })
    .onEnd((event) => {
      if (event.translationX >= 90 && onSwipeText) {
        translateX.value = withSpring(0);
        runOnJS(onSwipeText)();
      } else if (event.translationX >= 50 && event.translationX < 90 && onSwipeCall) {
        translateX.value = withSpring(0);
        runOnJS(onSwipeCall)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const callIndicatorStyle = useAnimatedStyle(() => {
    const isTextZone = translateX.value >= 70;
    const showCall = translateX.value >= 25 && !isTextZone;
    return {
      opacity: showCall ? 1 : 0,
      transform: [{ scale: showCall ? 1 : 0.5 }],
    };
  });

  const textIndicatorStyle = useAnimatedStyle(() => {
    const isTextZone = translateX.value >= 70;
    return {
      opacity: isTextZone ? 1 : 0,
      transform: [{ scale: isTextZone ? 1 : 0.5 }],
    };
  });

  const bgStyle = useAnimatedStyle(() => {
    const isTextZone = translateX.value >= 70;
    return {
      backgroundColor: isTextZone ? '#81B29A' : '#3D405B',
    };
  });

  return (
    <Animated.View
      entering={FadeInRight.delay(Math.min(index * 30, 300)).duration(300)}
      layout={Layout.springify()}
    >
      <View style={{ position: 'relative' }}>
        <Animated.View
          style={[bgStyle, {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 120,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 16,
            gap: 16,
          }]}
        >
          <Animated.View style={callIndicatorStyle}>
            <MaterialCommunityIcons name="phone" size={22} color="#FFF" />
          </Animated.View>
          <Animated.View style={textIndicatorStyle}>
            <MaterialCommunityIcons name="message-text" size={22} color="#FFF" />
          </Animated.View>
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={animatedCardStyle}>
            <TouchableOpacity
              onPress={onPress}
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
                borderWidth: isOverdue ? 1 : 0,
                borderColor: 'rgba(224, 122, 95, 0.2)',
              }}
            >
        <View style={{ position: 'relative' }}>
          {friend.photo ? (
            <Image
              source={{ uri: friend.photo }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: 2,
                borderColor: isOverdue ? '#E07A5F' : friend.isFavorite ? '#81B29A' : '#FFF',
              }}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: orbit?.color || '#81B29A',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: isOverdue ? '#E07A5F' : '#FFF',
                opacity: isOverdue ? 0.8 : 1,
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#FFF' }}>
                {friend.initials}
              </Text>
            </View>
          )}
          {isOverdue && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: '#E07A5F',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#FFF',
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: '#FFF' }}>
                !
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 17,
              color: '#3D405B',
            }}
            numberOfLines={1}
          >
            {friend.name}
          </Text>
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_600SemiBold',
              fontSize: 12,
              color: orbit?.color || '#E07A5F',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {orbit?.name || 'Unknown'}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 6, minWidth: 60 }}>
          <View
            style={{
              width: '100%',
              height: 6,
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${timeInfo.percentage}%`,
                backgroundColor: timeInfo.color,
                borderRadius: 3,
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: isOverdue ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
              fontSize: 10,
              color: timeInfo.color,
            }}
          >
            {timeInfo.text}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onMenuPress}
          style={{ padding: 4, marginLeft: -8, marginRight: -4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={20} color="rgba(61, 64, 91, 0.4)" />
        </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
};

export const PeopleScreen: React.FC<PeopleScreenProps> = ({
  onNavigateToProfile,
  onNavigateToNewConnection,
  onPremiumRequired,
}) => {
  const { friends, getOverdueFriends, refreshData, isLoading, canAddMoreFriends, getRemainingFreeSlots, premiumStatus, logInteraction, deleteFriend, interactions } = useApp();
  const { recordDailyActivity, addXP, checkAndUpdateAchievements, updateChallengeProgress, state: gamificationState, streakData } = useGamification();

  const updateGamificationOnInteraction = useCallback(async (type: string) => {
    await recordDailyActivity();
    const xpMap: Record<string, number> = { text: 5, call: 15, video_call: 20, in_person: 30, meetup: 30, other: 5 };
    addXP(xpMap[type] || 5, type);
    updateChallengeProgress(type === 'call' ? 'make_calls' : type === 'text' ? 'send_messages' : 'reach_out', 1);
    const callCount = interactions.filter(i => i.type === 'call').length + (type === 'call' ? 1 : 0);
    const textCount = interactions.filter(i => i.type === 'text').length + (type === 'text' ? 1 : 0);
    const inPersonCount = interactions.filter(i => i.type === 'in_person' || i.type === 'meetup').length + (type === 'in_person' || type === 'meetup' ? 1 : 0);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekInteractions = interactions.filter(i => new Date(i.date) >= oneWeekAgo);
    const uniquePeople = new Set(weekInteractions.map(i => i.friendId)).size;
    const completedChallenges = gamificationState.weeklyChallenges.filter(c => c.isCompleted).length;
    checkAndUpdateAchievements({
      totalInteractions: interactions.length + 1,
      callCount, textCount, inPersonCount,
      uniquePeopleThisWeek: uniquePeople,
      reconnections: 0,
      currentStreak: streakData.currentStreak,
      challengesCompleted: completedChallenges,
    });
  }, [recordDailyActivity, addXP, checkAndUpdateAchievements, updateChallengeProgress, interactions, streakData, gamificationState]);

  const handleAddConnection = () => {
    if (!canAddMoreFriends()) {
      onPremiumRequired?.();
    } else {
      onNavigateToNewConnection();
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuFriend, setMenuFriend] = useState<Friend | null>(null);

  const handleSwipeCall = async (friend: Friend) => {
    await logInteraction(friend.id, 'call', 'Quick call');
    await updateGamificationOnInteraction('call');
    Alert.alert('Call Logged!', `Call logged with ${friend.name}`);
  };

  const handleSwipeText = async (friend: Friend) => {
    await logInteraction(friend.id, 'text', 'Quick text');
    await updateGamificationOnInteraction('text');
    Alert.alert('Text Logged!', `Text logged with ${friend.name}`);
  };

  const handleMenuAction = async (action: 'view' | 'log' | 'favorite' | 'delete') => {
    if (!menuFriend) return;
    switch (action) {
      case 'view':
        onNavigateToProfile(menuFriend.id);
        break;
      case 'log':
        await logInteraction(menuFriend.id, 'text', 'Quick check-in');
        await updateGamificationOnInteraction('text');
        Alert.alert('Logged!', `Connection logged with ${menuFriend.name}`);
        break;
      case 'favorite':
        Alert.alert('Coming Soon', 'Favorite toggle will be available soon');
        break;
      case 'delete':
        Alert.alert(
          'Remove Contact',
          `Are you sure you want to remove ${menuFriend.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => deleteFriend(menuFriend.id) },
          ]
        );
        break;
    }
    setMenuFriend(null);
  };

  const overdueFriends = getOverdueFriends();
  const overdueIds = new Set(overdueFriends.map(f => f.id));

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'overdue', label: 'Overdue', count: overdueFriends.length },
    { key: 'all', label: 'All' },
    { key: 'inner', label: 'Favorites' },
    { key: 'close', label: 'Friends' },
    { key: 'catchup', label: 'Acquaintances' },
  ];

  const sortOptions: { key: SortType; label: string; icon: string }[] = [
    { key: 'name', label: 'Name (A-Z)', icon: 'sort-alphabetical-ascending' },
    { key: 'lastContact', label: 'Last Contact', icon: 'clock-outline' },
    { key: 'orbit', label: 'Orbit', icon: 'orbit' },
    { key: 'recentlyAdded', label: 'Recently Added', icon: 'account-plus' },
  ];

  const filteredFriends = useMemo(() => {
    let result = [...friends];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.initials.toLowerCase().includes(query)
      );
    }

    switch (activeFilter) {
      case 'overdue':
        result = result.filter(f => overdueIds.has(f.id));
        break;
      case 'favorites':
        result = result.filter(f => f.isFavorite);
        break;
      case 'inner':
        result = result.filter(f => f.orbitId === 'inner');
        break;
      case 'close':
        result = result.filter(f => f.orbitId === 'close');
        break;
      case 'catchup':
        result = result.filter(f => f.orbitId === 'catchup');
        break;
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'lastContact':
        result.sort((a, b) => {
          const aTime = a.lastContact ? new Date(a.lastContact).getTime() : 0;
          const bTime = b.lastContact ? new Date(b.lastContact).getTime() : 0;
          return bTime - aTime;
        });
        break;
      case 'orbit':
        const orbitOrder = { inner: 0, close: 1, catchup: 2 };
        result.sort((a, b) => orbitOrder[a.orbitId] - orbitOrder[b.orbitId]);
        break;
      case 'recentlyAdded':
        result.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
    }

    if (activeFilter !== 'overdue' && sortBy === 'name') {
      result.sort((a, b) => {
        const aOverdue = overdueIds.has(a.id);
        const bOverdue = overdueIds.has(b.id);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [friends, searchQuery, activeFilter, sortBy, overdueIds]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
      <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#3D405B' }}>
              My Universe
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#81B29A', marginLeft: 8 }}>
              ({friends.length})
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
            style={{ padding: 8, borderRadius: 20, backgroundColor: sortBy !== 'name' ? 'rgba(129, 178, 154, 0.1)' : 'transparent' }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="sort" size={24} color={sortBy !== 'name' ? '#81B29A' : '#3D405B'} />
          </TouchableOpacity>
        </View>

        {!premiumStatus.isPremium && (
          <TouchableOpacity 
            onPress={onPremiumRequired}
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 8, 
              backgroundColor: getRemainingFreeSlots() > 0 ? 'rgba(129, 178, 154, 0.1)' : 'rgba(224, 122, 95, 0.1)',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 9999,
              marginBottom: 16,
            }}
          >
            <MaterialCommunityIcons 
              name={getRemainingFreeSlots() > 0 ? "account-plus" : "lock"} 
              size={16} 
              color={getRemainingFreeSlots() > 0 ? "#81B29A" : "#E07A5F"} 
            />
            <Text style={{ 
              fontFamily: 'PlusJakartaSans_600SemiBold', 
              fontSize: 13, 
              color: getRemainingFreeSlots() > 0 ? "#81B29A" : "#E07A5F" 
            }}>
              {getRemainingFreeSlots() > 0 
                ? `${getRemainingFreeSlots()} free slot${getRemainingFreeSlots() !== 1 ? 's' : ''} remaining`
                : 'Upgrade for unlimited contacts'}
            </Text>
          </TouchableOpacity>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
            borderRadius: 16,
            paddingHorizontal: 16,
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={22} color="rgba(61, 64, 91, 0.4)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search friends..."
            placeholderTextColor="rgba(61, 64, 91, 0.4)"
            style={{
              flex: 1,
              paddingVertical: 16,
              paddingHorizontal: 12,
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 16,
              color: '#3D405B',
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="rgba(61, 64, 91, 0.4)" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(200).duration(400)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12, gap: 10 }}
        >
          {filters.slice(0, 2).map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 9999,
                backgroundColor: activeFilter === filter.key
                  ? filter.key === 'overdue' ? 'rgba(224, 122, 95, 0.1)' : '#3D405B'
                  : '#F4F1DE',
                borderWidth: filter.key === 'overdue' && activeFilter === filter.key ? 1 : 0,
                borderColor: 'rgba(224, 122, 95, 0.3)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_700Bold',
                  fontSize: 14,
                  color: activeFilter === filter.key
                    ? filter.key === 'overdue' ? '#E07A5F' : '#FFF'
                    : '#3D405B',
                }}
              >
                {filter.label}{filter.count !== undefined ? ` (${filter.count})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
          {filters.slice(2).map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 9999,
                backgroundColor: activeFilter === filter.key ? '#3D405B' : '#F4F1DE',
              }}
            >
              <Text
                style={{
                  fontFamily: activeFilter === filter.key ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_600SemiBold',
                  fontSize: 14,
                  color: activeFilter === filter.key ? '#FFF' : '#3D405B',
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#81B29A" />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredFriends.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={{ paddingVertical: 60, alignItems: 'center' }}>
            <MaterialCommunityIcons name="account-search" size={64} color="rgba(61, 64, 91, 0.2)" />
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginTop: 16 }}>
              {searchQuery ? 'No matches found' : 'No connections yet'}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginTop: 8, textAlign: 'center' }}>
              {searchQuery ? 'Try a different search term' : 'Add your first connection to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={handleAddConnection}
                style={{
                  marginTop: 24,
                  backgroundColor: '#E07A5F',
                  paddingHorizontal: 32,
                  paddingVertical: 14,
                  borderRadius: 9999,
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
                  Add Connection
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        ) : (
          filteredFriends.map((friend, index) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              index={index}
              onPress={() => onNavigateToProfile(friend.id)}
              isOverdue={overdueIds.has(friend.id)}
              onSwipeCall={() => handleSwipeCall(friend)}
              onSwipeText={() => handleSwipeText(friend)}
              onMenuPress={() => setMenuFriend(friend)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={handleAddConnection}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#E07A5F',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#E07A5F',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: '#3D405B', marginBottom: 20 }}>
              Sort By
            </Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => { setSortBy(option.key); setShowSortModal(false); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(0,0,0,0.05)',
                }}
              >
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={24}
                  color={sortBy === option.key ? '#81B29A' : 'rgba(61, 64, 91, 0.4)'}
                />
                <Text style={{
                  flex: 1,
                  fontFamily: sortBy === option.key ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_500Medium',
                  fontSize: 16,
                  color: sortBy === option.key ? '#3D405B' : 'rgba(61, 64, 91, 0.7)',
                  marginLeft: 16,
                }}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <MaterialCommunityIcons name="check" size={24} color="#81B29A" />
                )}
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={!!menuFriend}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuFriend(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMenuFriend(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            {menuFriend && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#81B29A', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#FFF' }}>
                      {menuFriend.initials}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginLeft: 16 }}>
                    {menuFriend.name}
                  </Text>
                </View>
                {[
                  { action: 'view' as const, icon: 'account', label: 'View Profile' },
                  { action: 'log' as const, icon: 'check-circle', label: 'Log Connection' },
                  { action: 'favorite' as const, icon: 'star', label: 'Toggle Favorite' },
                  { action: 'delete' as const, icon: 'trash-can', label: 'Remove', color: '#E07A5F' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.action}
                    onPress={() => handleMenuAction(item.action)}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}
                  >
                    <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color || '#3D405B'} />
                    <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: item.color || '#3D405B', marginLeft: 16 }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <View style={{ height: 40 }} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
