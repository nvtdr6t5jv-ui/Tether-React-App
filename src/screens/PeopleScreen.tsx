import React, { useState, useMemo } from 'react';
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
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useApp, Friend } from '../context/AppContext';
import { ORBITS } from '../types';

type FilterType = 'all' | 'overdue' | 'favorites' | 'inner' | 'close' | 'catchup';

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
  onSwipeLog?: () => void;
  onMenuPress?: () => void;
}> = ({ friend, index, onPress, isOverdue, onSwipeLog, onMenuPress }) => {
  const timeInfo = getTimeSince(friend.lastContact);
  const orbit = ORBITS.find(o => o.id === friend.orbitId);
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, 100);
      }
    })
    .onEnd((event) => {
      if (event.translationX > 80 && onSwipeLog) {
        translateX.value = withSpring(0);
        runOnJS(onSwipeLog)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const swipeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: Math.min(translateX.value / 80, 1),
    transform: [{ scale: Math.min(translateX.value / 80, 1) }],
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).duration(300)}
      layout={Layout.springify()}
    >
      <View style={{ position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 80,
            backgroundColor: '#81B29A',
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={swipeIndicatorStyle}>
            <MaterialCommunityIcons name="check" size={28} color="#FFF" />
          </Animated.View>
        </View>
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
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#E07A5F',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#FFF',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>!</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 16,
              color: '#3D405B',
              marginBottom: 2,
            }}
          >
            {friend.name}
          </Text>
          <Text
            numberOfLines={1}
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
  const { friends, getOverdueFriends, refreshData, isLoading, canAddMoreFriends, getRemainingFreeSlots, premiumStatus, logInteraction } = useApp();

  const handleAddConnection = () => {
    if (!canAddMoreFriends()) {
      onPremiumRequired?.();
    } else {
      onNavigateToNewConnection();
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [menuFriend, setMenuFriend] = useState<Friend | null>(null);

  const handleMenuAction = (action: 'view' | 'log' | 'favorite' | 'delete') => {
    if (!menuFriend) return;
    switch (action) {
      case 'view':
        onNavigateToProfile(menuFriend.id);
        break;
      case 'log':
        logInteraction(menuFriend.id, 'text', 'Quick check-in');
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
            { text: 'Remove', style: 'destructive', onPress: () => {} },
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

    result.sort((a, b) => {
      const aOverdue = overdueIds.has(a.id);
      const bOverdue = overdueIds.has(b.id);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [friends, searchQuery, activeFilter, overdueIds]);

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
            style={{ padding: 8, borderRadius: 20 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="sort" size={24} color="#3D405B" />
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#81B29A" />
        }
      >
        {filteredFriends.length === 0 ? (
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
            <MaterialCommunityIcons
              name={searchQuery ? 'account-search' : 'account-group'}
              size={48}
              color="rgba(61, 64, 91, 0.3)"
            />
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 16,
                color: '#3D405B',
                marginTop: 16,
              }}
            >
              {searchQuery ? 'No friends found' : 'No friends yet'}
            </Text>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_400Regular',
                fontSize: 14,
                color: 'rgba(61, 64, 91, 0.6)',
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {searchQuery ? 'Try a different search term' : 'Add your first connection to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={handleAddConnection}
                style={{
                  marginTop: 20,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: '#E07A5F',
                  borderRadius: 9999,
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
                  Add Connection
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <MaterialCommunityIcons name="gesture-swipe-right" size={14} color="rgba(61, 64, 91, 0.4)" />
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(61, 64, 91, 0.4)' }}>
                Swipe right to quick log
              </Text>
            </View>
            {filteredFriends.map((friend, index) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                index={index}
                onPress={() => onNavigateToProfile(friend.id)}
                isOverdue={overdueIds.has(friend.id)}
                onSwipeLog={() => {
                  logInteraction(friend.id, 'text', 'Quick check-in');
                  Alert.alert('Logged!', `Quick check-in with ${friend.name}`);
                }}
                onMenuPress={() => setMenuFriend(friend)}
              />
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={handleAddConnection}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: canAddMoreFriends() ? '#E07A5F' : '#81B29A',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: canAddMoreFriends() ? '#E07A5F' : '#81B29A',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <MaterialCommunityIcons name={canAddMoreFriends() ? "plus" : "lock"} size={32} color="#FFF" />
      </TouchableOpacity>

      <Modal
        visible={!!menuFriend}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuFriend(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setMenuFriend(null)}
        >
          <View
            style={{
              backgroundColor: '#FFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 8,
              paddingBottom: 40,
            }}
          >
            <View style={{ width: 40, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            {menuFriend && (
              <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: ORBITS.find(o => o.id === menuFriend.orbitId)?.color || '#81B29A',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#FFF' }}>
                      {menuFriend.initials}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
                      {menuFriend.name}
                    </Text>
                    <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: 'rgba(61, 64, 91, 0.6)' }}>
                      {ORBITS.find(o => o.id === menuFriend.orbitId)?.name || 'Contact'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleMenuAction('view')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 }}
                >
                  <MaterialCommunityIcons name="account" size={24} color="#3D405B" />
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B' }}>View Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleMenuAction('log')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 }}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={24} color="#81B29A" />
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B' }}>Quick Log</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleMenuAction('favorite')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 }}
                >
                  <MaterialCommunityIcons name={menuFriend.isFavorite ? "star" : "star-outline"} size={24} color="#F2CC8F" />
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B' }}>
                    {menuFriend.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleMenuAction('delete')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 }}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={24} color="#E07A5F" />
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#E07A5F' }}>Remove Contact</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
