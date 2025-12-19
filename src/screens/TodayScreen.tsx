import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  SlideInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useApp, Friend } from "../context/AppContext";
import { ORBITS, QUICK_TAGS, CONVERSATION_STARTERS, QuickTag, Orbit } from "../types";
import { ShuffleModal } from "../components/ShuffleModal";
import { LogConnectionModal } from "../components/LogConnectionModal";
import { DrawerModal } from "../components/DrawerModal";
import { QuickLogModal } from "../components/QuickLogModal";
import { DailyCheckInModal } from "../components/DailyCheckInModal";
import { MilestoneModal } from "../components/MilestoneModal";

const { width } = Dimensions.get("window");
const ORBIT_SIZE = width - 64;

const getAvatarColor = (index: number) => {
  const colors = ['#E07A5F', '#81B29A', '#3D405B', '#F2CC8F', '#6366F1', '#EC4899'];
  return colors[index % colors.length];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getDateString = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
};

interface ActionCardProps {
  friend: Friend;
  index: number;
  onQuickLog: () => void;
  onViewProfile: () => void;
  onSwipeComplete: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ friend, index, onQuickLog, onViewProfile, onSwipeComplete }) => {
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const orbit = ORBITS.find(o => o.id === friend.orbitId);

  const getTimeSince = () => {
    if (!friend.lastContact) return "Never connected";
    const diff = Date.now() - new Date(friend.lastContact).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return "1 week ago";
    return `${weeks} weeks ago`;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > 100) {
        translateX.value = withTiming(width, { duration: 200 });
        cardOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onSwipeComplete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  const swipeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: Math.min(translateX.value / 100, 1),
    transform: [{ scale: Math.min(translateX.value / 100, 1) }],
  }));

  return (
    <Animated.View entering={SlideInRight.delay(200 + index * 100).duration(400).springify()}>
      <View style={{ position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 80,
            backgroundColor: '#81B29A',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={swipeIndicatorStyle}>
            <MaterialCommunityIcons name="check" size={32} color="#FFF" />
          </Animated.View>
        </View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              onPress={onViewProfile}
              activeOpacity={0.95}
              style={{
                backgroundColor: "#FFF",
                padding: 16,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                shadowColor: "#3D405B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: orbit?.color || "#81B29A",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "#FFF",
                }}
              >
                {friend.photo ? (
                  <Image source={{ uri: friend.photo }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                ) : (
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#FFF" }}>
                    {friend.initials}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#3D405B", marginBottom: 2 }}>
                  Reach out to {friend.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)" }}>
                    {getTimeSince()}
                  </Text>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(61, 64, 91, 0.3)" }} />
                  <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: orbit?.color }}>
                    {orbit?.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onQuickLog}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: "#81B29A",
                  borderRadius: 9999,
                }}
              >
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#FFF" }}>
                  Log
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
};

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  connectionsThisWeek: number;
  onPress?: () => void;
}

const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, longestStreak, connectionsThisWeek, onPress }) => {
  const flameScale = useSharedValue(1);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  return (
    <Animated.View entering={FadeInUp.delay(300).duration(500)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={{
          backgroundColor: "#FFF",
          padding: 20,
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          shadowColor: "#3D405B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <Animated.View style={flameStyle}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="fire" size={28} color="#F97316" />
          </View>
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 24, color: "#3D405B" }}>
            {currentStreak} day streak!
          </Text>
          <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)" }}>
            {connectionsThisWeek} connections this week
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 12, color: "rgba(61, 64, 91, 0.4)" }}>
            Best: {longestStreak}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(61, 64, 91, 0.3)" style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface OrbitAvatarProps {
  friend: Friend;
  index: number;
  total: number;
  orbitLevel: number;
  onPress: () => void;
}

const OrbitAvatar: React.FC<OrbitAvatarProps> = ({ friend, index, total, orbitLevel, onPress }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(300 + index * 100, withSpring(1, { damping: 12 }));
    translateY.value = withDelay(
      500 + index * 100,
      withRepeat(
        withTiming(-4, { duration: 2000 + index * 300, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const radius = ORBIT_SIZE * (0.18 + orbitLevel * 0.14);
  const angleOffset = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
  const x = Math.cos(angleOffset) * radius;
  const y = Math.sin(angleOffset) * radius;

  const size = 36 - orbitLevel * 4;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          left: ORBIT_SIZE / 2 + x - size / 2,
          top: ORBIT_SIZE / 2 + y - size / 2,
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {friend.photo ? (
          <Image
            source={{ uri: friend.photo }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 2,
              borderColor: "#FFF",
            }}
          />
        ) : (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: getAvatarColor(index),
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#FFF",
            }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: size * 0.35, color: "#FFF" }}>
              {friend.initials}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface TodayScreenProps {
  onNavigate?: (screen: string) => void;
  onNavigateToSocialPulse?: () => void;
  onNavigateToProgress?: () => void;
  onNavigateToProfile?: (friendId: string) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ onNavigate, onNavigateToSocialPulse, onNavigateToProgress, onNavigateToProfile }) => {
  const { 
    friends, 
    interactions,
    logInteraction, 
    getSocialHealthStats, 
    getOverdueFriends,
    getUpcomingBirthdays,
    userProfile,
  } = useApp();
  
  const [showShuffle, setShowShuffle] = useState(false);
  const [showLogConnection, setShowLogConnection] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<{ title: string; description: string } | null>(null);

  const stats = getSocialHealthStats();
  const overdueFriends = getOverdueFriends();
  const upcomingBirthdays = getUpcomingBirthdays();

  const friendsByOrbit = useMemo(() => ({
    inner: friends.filter(f => f.orbitId === "inner"),
    close: friends.filter(f => f.orbitId === "close"),
    catchup: friends.filter(f => f.orbitId === "catchup"),
  }), [friends]);

  const todaysFocus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayInteractions = interactions.filter(i => new Date(i.date) >= today);
    const contactedIds = new Set(todayInteractions.map(i => i.friendId));

    return overdueFriends
      .filter(f => !contactedIds.has(f.id))
      .slice(0, 5);
  }, [overdueFriends, interactions]);

  const randomStarter = useMemo(() => {
    return CONVERSATION_STARTERS[Math.floor(Math.random() * CONVERSATION_STARTERS.length)];
  }, []);

  const handleQuickLog = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowQuickLog(true);
  };

  const handleSwipeComplete = async (friend: Friend) => {
    await logInteraction(friend.id, 'text', 'Quick check-in');
  };

  const handleLogConnection = (friendId: string, type: string, note: string) => {
    logInteraction(friendId, type as any, note);
  };

  const completedToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return interactions.filter(i => new Date(i.date) >= today).length;
  }, [interactions]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F6" }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 28, color: "#3D405B", lineHeight: 34 }}>
                {getGreeting()},{"\n"}
                <Text style={{ color: "#E07A5F" }}>{userProfile?.name?.split(' ')[0] || 'Friend'}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowDailyCheckIn(true)}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#E07A5F",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#FFF",
                }}
              >
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 18, color: "#FFF" }}>
                  {userProfile?.name?.charAt(0) || 'A'}
                </Text>
              </View>
              {todaysFocus.length > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#E07A5F",
                    borderWidth: 2,
                    borderColor: "#F7F8F6",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 10, color: "#FFF" }}>
                    {todaysFocus.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "#81B29A", marginTop: 4 }}>
            {getDateString()}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(400)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <StreakCard 
            currentStreak={stats.currentStreak} 
            longestStreak={stats.longestStreak}
            connectionsThisWeek={stats.connectionsThisWeek}
            onPress={onNavigateToProgress}
          />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(600)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => onNavigate?.("people")}
            activeOpacity={0.95}
            style={{
              width: "100%",
              aspectRatio: 1,
              backgroundColor: "#F4F1DE",
              borderRadius: 24,
              overflow: "hidden",
              shadowColor: "#3D405B",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 4,
            }}
          >
            <View style={{ position: "absolute", top: 16, left: 16, backgroundColor: "rgba(255,255,255,0.7)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 }}>
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 11, color: "#3D405B", letterSpacing: 1, textTransform: "uppercase" }}>Your Orbit</Text>
            </View>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: ORBIT_SIZE, height: ORBIT_SIZE, alignItems: "center", justifyContent: "center" }}>
                <View style={{ position: "absolute", width: ORBIT_SIZE * 0.85, height: ORBIT_SIZE * 0.85, borderRadius: ORBIT_SIZE * 0.425, borderWidth: 1, borderColor: "rgba(61, 64, 91, 0.06)", borderStyle: "dashed" }} />
                <View style={{ position: "absolute", width: ORBIT_SIZE * 0.6, height: ORBIT_SIZE * 0.6, borderRadius: ORBIT_SIZE * 0.3, borderWidth: 1, borderColor: "rgba(61, 64, 91, 0.1)", borderStyle: "dashed" }} />
                <View style={{ position: "absolute", width: ORBIT_SIZE * 0.35, height: ORBIT_SIZE * 0.35, borderRadius: ORBIT_SIZE * 0.175, borderWidth: 1, borderColor: "rgba(61, 64, 91, 0.15)", borderStyle: "dashed" }} />

                <Animated.View
                  entering={ZoomIn.delay(200).duration(500).springify()}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#E07A5F",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "#FFF",
                    shadowColor: "#E07A5F",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                    zIndex: 10,
                  }}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#FFF" }}>
                    {userProfile?.name?.charAt(0) || 'Me'}
                  </Text>
                </Animated.View>

                {friendsByOrbit.inner.map((friend, i) => (
                  <OrbitAvatar key={friend.id} friend={friend} index={i} total={friendsByOrbit.inner.length} orbitLevel={0} onPress={() => onNavigateToProfile?.(friend.id)} />
                ))}
                {friendsByOrbit.close.map((friend, i) => (
                  <OrbitAvatar key={friend.id} friend={friend} index={i + friendsByOrbit.inner.length} total={friendsByOrbit.close.length} orbitLevel={1} onPress={() => onNavigateToProfile?.(friend.id)} />
                ))}
                {friendsByOrbit.catchup.map((friend, i) => (
                  <OrbitAvatar key={friend.id} friend={friend} index={i + friendsByOrbit.inner.length + friendsByOrbit.close.length} total={friendsByOrbit.catchup.length} orbitLevel={2} onPress={() => onNavigateToProfile?.(friend.id)} />
                ))}
              </View>
            </View>

            <View style={{ position: "absolute", bottom: 16, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {ORBITS.map(orbit => (
                  <View key={orbit.id} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: orbit.color }} />
                    <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 11, color: "rgba(61, 64, 91, 0.7)" }}>
                      {friendsByOrbit[orbit.id as keyof typeof friendsByOrbit].length}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 11, color: "#81B29A" }}>View All</Text>
                <MaterialCommunityIcons name="chevron-right" size={14} color="#81B29A" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingHorizontal: 4 }}>
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 20, color: "#3D405B" }}>
              Today's Focus
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialCommunityIcons name="gesture-swipe-right" size={16} color="rgba(61, 64, 91, 0.4)" />
              <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 12, color: "rgba(61, 64, 91, 0.4)" }}>
                Swipe to complete
              </Text>
            </View>
          </View>

          {todaysFocus.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFF",
                padding: 32,
                borderRadius: 20,
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name="check-decagram" size={56} color="#81B29A" />
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#3D405B", marginTop: 12 }}>
                All caught up!
              </Text>
              <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)", marginTop: 4, textAlign: "center" }}>
                You've reached out to everyone today. Great job!
              </Text>
              <TouchableOpacity
                onPress={() => setShowShuffle(true)}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: "#81B29A",
                  borderRadius: 9999,
                }}
              >
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#FFF" }}>
                  Surprise Me
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {todaysFocus.map((friend, index) => (
                <ActionCard
                  key={friend.id}
                  friend={friend}
                  index={index}
                  onQuickLog={() => handleQuickLog(friend)}
                  onViewProfile={() => onNavigateToProfile?.(friend.id)}
                  onSwipeComplete={() => handleSwipeComplete(friend)}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {upcomingBirthdays.length > 0 && (
          <Animated.View entering={FadeInUp.delay(500).duration(500)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 20, color: "#3D405B", marginBottom: 12, paddingHorizontal: 4 }}>
              Coming Up
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {upcomingBirthdays.slice(0, 5).map((item, index) => (
                <Animated.View key={item.friend.id} entering={FadeInRight.delay(500 + index * 50).duration(300)}>
                  <TouchableOpacity
                    onPress={() => onNavigateToProfile?.(item.friend.id)}
                    style={{
                      backgroundColor: "#FFF",
                      padding: 16,
                      borderRadius: 16,
                      alignItems: "center",
                      width: 110,
                      shadowColor: "#3D405B",
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
                        backgroundColor: "rgba(236, 72, 153, 0.1)",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <MaterialCommunityIcons name="cake-variant" size={24} color="#EC4899" />
                    </View>
                    <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 13, color: "#3D405B" }} numberOfLines={1}>
                      {item.friend.name.split(' ')[0]}
                    </Text>
                    <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 11, color: "#EC4899", marginTop: 2 }}>
                      {item.daysUntil === 0 ? "Today!" : item.daysUntil === 1 ? "Tomorrow" : `In ${item.daysUntil} days`}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(600).duration(500)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 20, color: "#3D405B", marginBottom: 12, paddingHorizontal: 4 }}>
            Conversation Starter
          </Text>
          <View
            style={{
              backgroundColor: "#F4F1DE",
              padding: 20,
              borderRadius: 20,
              borderLeftWidth: 4,
              borderLeftColor: "#81B29A",
            }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 16, color: "#3D405B", lineHeight: 24, fontStyle: "italic" }}>
              "{randomStarter.text}"
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 }}>
              <View style={{ backgroundColor: "rgba(129, 178, 154, 0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 }}>
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 11, color: "#81B29A", textTransform: "capitalize" }}>
                  {randomStarter.category.replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(500)} style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 20, color: "#3D405B", marginBottom: 12, paddingHorizontal: 4 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setShowShuffle(true)}
              style={{
                flex: 1,
                backgroundColor: "#81B29A",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name="shuffle-variant" size={24} color="#FFF" />
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#FFF", marginTop: 6 }}>
                Shuffle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowLogConnection(true)}
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: "#3D405B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#3D405B" />
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#3D405B", marginTop: 6 }}>
                Log
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNavigate?.("calendar")}
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: "#3D405B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <MaterialCommunityIcons name="calendar" size={24} color="#3D405B" />
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#3D405B", marginTop: 6 }}>
                Events
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onNavigateToSocialPulse}
              style={{
                flex: 1,
                backgroundColor: "#FFF",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: "#3D405B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <MaterialCommunityIcons name="chart-line" size={24} color="#3D405B" />
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#3D405B", marginTop: 6 }}>
                Insights
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <ShuffleModal
        visible={showShuffle}
        onClose={() => setShowShuffle(false)}
        friends={friends}
        onMessage={(friend) => {
          setShowShuffle(false);
          logInteraction(friend.id, 'text');
        }}
      />

      <LogConnectionModal
        visible={showLogConnection}
        onClose={() => setShowLogConnection(false)}
        friends={friends}
        onLogConnection={handleLogConnection}
      />

      {selectedFriend && (
        <QuickLogModal
          visible={showQuickLog}
          onClose={() => {
            setShowQuickLog(false);
            setSelectedFriend(null);
          }}
          friend={selectedFriend}
          onLog={(type, tag, note) => {
            logInteraction(selectedFriend.id, type, note || tag);
            setShowQuickLog(false);
            setSelectedFriend(null);
          }}
        />
      )}

      <DailyCheckInModal
        visible={showDailyCheckIn}
        onClose={() => setShowDailyCheckIn(false)}
        completedCount={completedToday}
        totalGoal={Math.max(todaysFocus.length, 3)}
        friends={friends}
      />

      {currentMilestone && (
        <MilestoneModal
          visible={showMilestone}
          onClose={() => {
            setShowMilestone(false);
            setCurrentMilestone(null);
          }}
          title={currentMilestone.title}
          description={currentMilestone.description}
        />
      )}
    </SafeAreaView>
  );
};