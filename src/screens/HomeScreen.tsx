import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useApp, TetheredFriend } from "../context/AppContext";
import { orbits, getAvatarColor } from "../constants/mockData";
import { ShuffleModal } from "../components/ShuffleModal";
import { LogConnectionModal } from "../components/LogConnectionModal";
import { HealthStatusModal } from "../components/HealthStatusModal";
import { EventModal } from "../components/EventModal";

const { width } = Dimensions.get("window");
const ORBIT_SIZE = width - 32;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getDateString = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
};

const OrbitAvatar: React.FC<{
  friend: TetheredFriend;
  index: number;
  total: number;
  orbitLevel: number;
}> = ({ friend, index, total, orbitLevel }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(300 + index * 100, withSpring(1, { damping: 12 }));
    translateY.value = withDelay(
      500 + index * 100,
      withRepeat(
        withTiming(-6, { duration: 2000 + index * 300, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const radius = ORBIT_SIZE * (0.2 + orbitLevel * 0.12);
  const angleOffset = (index / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2;
  const x = Math.cos(angleOffset) * radius;
  const y = Math.sin(angleOffset) * radius;

  const size = 40 - orbitLevel * 4;

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
          <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: size * 0.35, color: "#FFF" }}>
            {friend.initials}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

interface NudgeCardProps {
  friend: TetheredFriend;
  index: number;
  onAction: () => void;
}

const NudgeCard: React.FC<NudgeCardProps> = ({ friend, index, onAction }) => {
  const getTimeSince = () => {
    if (!friend.lastContact) return "Never connected";
    const diff = Date.now() - friend.lastContact.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return "1 week ago";
    return `${weeks} weeks ago`;
  };

  const orbit = orbits.find(o => o.id === friend.orbitId);

  return (
    <Animated.View entering={SlideInRight.delay(200 + index * 100).duration(400).springify()}>
      <TouchableOpacity
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
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "rgba(224, 122, 95, 0.1)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name="hand-wave" size={24} color="#E07A5F" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#3D405B", marginBottom: 2 }}>
            Nudge {friend.name}.
          </Text>
          <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)" }}>
            {getTimeSince()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onAction}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: "#F4F1DE",
            borderRadius: 9999,
          }}
        >
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#3D405B" }}>
            {orbit?.id === "inner" ? "Call" : "Text"}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface ToolkitCardProps {
  icon: string;
  title: string;
  subtitle: string;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
  textColor: string;
  index: number;
  onPress?: () => void;
  badge?: string;
}

const ToolkitCard: React.FC<ToolkitCardProps> = ({
  icon,
  title,
  subtitle,
  bgColor,
  iconBgColor,
  iconColor,
  textColor,
  index,
  onPress,
  badge,
}) => (
  <Animated.View entering={FadeInUp.delay(400 + index * 100).duration(500).springify()}>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: bgColor,
        padding: 16,
        borderRadius: 20,
        height: 140,
        justifyContent: "space-between",
        shadowColor: "#3D405B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: iconBgColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
        </View>
        {badge && (
          <View style={{ backgroundColor: "rgba(129, 178, 154, 0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 }}>
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#81B29A" }}>{badge}</Text>
          </View>
        )}
      </View>
      <View>
        <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: textColor, marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 12, color: textColor, opacity: 0.7 }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  </Animated.View>
);

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { friends, updateLastContact } = useApp();
  const [activeTab, setActiveTab] = useState<"overdue" | "drafts" | "events">("overdue");
  
  const [showShuffle, setShowShuffle] = useState(false);
  const [showLogConnection, setShowLogConnection] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [showEvent, setShowEvent] = useState(false);

  const overdueCount = friends.filter(f => {
    if (!f.nextNudge) return true;
    return new Date() > f.nextNudge;
  }).length;

  const friendsByOrbit = {
    inner: friends.filter(f => f.orbitId === "inner"),
    close: friends.filter(f => f.orbitId === "close"),
    catchup: friends.filter(f => f.orbitId === "catchup"),
  };

  const handleNudgeAction = (friendId: string) => {
    updateLastContact(friendId);
  };

  const handleLogConnection = (friendId: string, type: string, note: string) => {
    updateLastContact(friendId);
  };

  const healthPercentage = friends.length > 0
    ? Math.round(((friends.length - overdueCount) / friends.length) * 100)
    : 100;

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
                <Text style={{ color: "#E07A5F" }}>Alex</Text>
              </Text>
            </View>
            <View style={{ position: "relative" }}>
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
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 18, color: "#FFF" }}>A</Text>
              </View>
              {overdueCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: "#E07A5F",
                    borderWidth: 2,
                    borderColor: "#F7F8F6",
                  }}
                />
              )}
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "#81B29A" }}>
              {getDateString()} {friends.length > 0 ? `• ${Math.min(overdueCount, friends.length)} friends to catch up with` : ""}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(600)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              backgroundColor: "#F4F1DE",
              borderRadius: 20,
              overflow: "hidden",
              shadowColor: "#3D405B",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 4,
            }}
          >
            <View style={{ position: "absolute", top: 16, left: 16, backgroundColor: "rgba(255,255,255,0.6)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 }}>
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 10, color: "#3D405B", letterSpacing: 1, textTransform: "uppercase" }}>Your Orbit</Text>
            </View>

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: ORBIT_SIZE, height: ORBIT_SIZE, alignItems: "center", justifyContent: "center" }}>
                <View style={{ position: "absolute", width: ORBIT_SIZE * 0.9, height: ORBIT_SIZE * 0.9, borderRadius: ORBIT_SIZE * 0.45, borderWidth: 1, borderColor: "rgba(61, 64, 91, 0.05)" }} />
                <View style={{ position: "absolute", width: ORBIT_SIZE * 0.65, height: ORBIT_SIZE * 0.65, borderRadius: ORBIT_SIZE * 0.325, borderWidth: 1, borderColor: "rgba(61, 64, 91, 0.1)" }} />
                <View style={{ position: "absolute", width: ORBIT_SIZE * 0.4, height: ORBIT_SIZE * 0.4, borderRadius: ORBIT_SIZE * 0.2, borderWidth: 1, borderColor: "rgba(61, 64, 91, 0.15)" }} />

                <Animated.View
                  entering={ZoomIn.delay(200).duration(500).springify()}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#E07A5F",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 4,
                    borderColor: "#FFF",
                    shadowColor: "#E07A5F",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                    zIndex: 10,
                  }}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 16, color: "#FFF" }}>Me</Text>
                </Animated.View>

                {friendsByOrbit.inner.map((friend, i) => (
                  <OrbitAvatar key={friend.id} friend={friend} index={i} total={friendsByOrbit.inner.length} orbitLevel={0} />
                ))}
                {friendsByOrbit.close.map((friend, i) => (
                  <OrbitAvatar key={friend.id} friend={friend} index={i + friendsByOrbit.inner.length} total={friendsByOrbit.close.length} orbitLevel={1} />
                ))}
                {friendsByOrbit.catchup.map((friend, i) => (
                  <OrbitAvatar key={friend.id} friend={friend} index={i + friendsByOrbit.inner.length + friendsByOrbit.close.length} total={friendsByOrbit.catchup.length} orbitLevel={2} />
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowShuffle(true)}
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#81B29A",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#81B29A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <MaterialCommunityIcons name="shuffle-variant" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 20, color: "#3D405B", marginBottom: 12, paddingLeft: 4 }}>
            Your Focus.
          </Text>

          <View style={{ backgroundColor: "rgba(0,0,0,0.04)", padding: 4, borderRadius: 16, flexDirection: "row", gap: 4, marginBottom: 16 }}>
            {[
              { key: "overdue", label: `Overdue (${overdueCount})` },
              { key: "drafts", label: "Drafts" },
              { key: "events", label: "Events" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: activeTab === tab.key ? "#FFF" : "transparent",
                  shadowColor: activeTab === tab.key ? "#000" : "transparent",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: activeTab === tab.key ? 0.05 : 0,
                  shadowRadius: 2,
                  elevation: activeTab === tab.key ? 1 : 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: activeTab === tab.key ? "PlusJakartaSans_700Bold" : "PlusJakartaSans_500Medium",
                    fontSize: 14,
                    color: activeTab === tab.key ? "#3D405B" : "rgba(61, 64, 91, 0.6)",
                    textAlign: "center",
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ gap: 12 }}>
            {activeTab === "overdue" && friends.length > 0 ? (
              friends.slice(0, 3).map((friend, index) => (
                <NudgeCard
                  key={friend.id}
                  friend={friend}
                  index={index}
                  onAction={() => handleNudgeAction(friend.id)}
                />
              ))
            ) : activeTab === "overdue" ? (
              <View style={{ backgroundColor: "#FFF", padding: 24, borderRadius: 20, alignItems: "center" }}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color="#81B29A" />
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 16, color: "#3D405B", marginTop: 12 }}>
                  All caught up!
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 14, color: "rgba(61, 64, 91, 0.6)", marginTop: 4 }}>
                  No friends to nudge right now.
                </Text>
              </View>
            ) : (
              <View style={{ backgroundColor: "#FFF", padding: 24, borderRadius: 20, alignItems: "center" }}>
                <MaterialCommunityIcons name="file-document-outline" size={48} color="rgba(61, 64, 91, 0.3)" />
                <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)", marginTop: 12 }}>
                  No {activeTab} yet.
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 20, color: "#3D405B", marginBottom: 12, paddingLeft: 4 }}>
            The Toolkit.
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <View style={{ width: (width - 44) / 2 }}>
              <ToolkitCard
                icon="dice-multiple"
                title="Shuffle."
                subtitle="Pick a random friend."
                bgColor="#81B29A"
                iconBgColor="rgba(255,255,255,0.2)"
                iconColor="#FFF"
                textColor="#FFF"
                index={0}
                onPress={() => setShowShuffle(true)}
              />
            </View>
            <View style={{ width: (width - 44) / 2 }}>
              <ToolkitCard
                icon="plus"
                title="Log."
                subtitle="Track a chat."
                bgColor="#F4F1DE"
                iconBgColor="#FFF"
                iconColor="#3D405B"
                textColor="#3D405B"
                index={1}
                onPress={() => setShowLogConnection(true)}
              />
            </View>
            <View style={{ width: (width - 44) / 2 }}>
              <ToolkitCard
                icon="cake-variant"
                title="Birthdays."
                subtitle="Coming up soon."
                bgColor="#F4F1DE"
                iconBgColor="#FFF"
                iconColor="#E07A5F"
                textColor="#3D405B"
                index={2}
                onPress={() => setShowEvent(true)}
              />
            </View>
            <View style={{ width: (width - 44) / 2 }}>
              <ToolkitCard
                icon="heart-pulse"
                title="Health."
                subtitle="Social score."
                bgColor="#FFF"
                iconBgColor="#F4F1DE"
                iconColor="#81B29A"
                textColor="#3D405B"
                index={3}
                onPress={() => setShowHealth(true)}
                badge={`${healthPercentage}%`}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <ShuffleModal
        visible={showShuffle}
        onClose={() => setShowShuffle(false)}
        friends={friends}
        onMessage={(friend) => {
          setShowShuffle(false);
          updateLastContact(friend.id);
        }}
      />

      <LogConnectionModal
        visible={showLogConnection}
        onClose={() => setShowLogConnection(false)}
        friends={friends}
        onLogConnection={handleLogConnection}
      />

      <HealthStatusModal
        visible={showHealth}
        onClose={() => setShowHealth(false)}
        friends={friends}
        onViewAnalytics={() => {
          setShowHealth(false);
        }}
      />

      <EventModal
        visible={showEvent}
        onClose={() => setShowEvent(false)}
      />
    </SafeAreaView>
  );
};
