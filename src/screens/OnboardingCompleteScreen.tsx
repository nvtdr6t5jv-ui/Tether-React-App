import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useOnboarding } from "../context/OnboardingContext";
import { useApp, Friend } from "../context/AppContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");
const ORBIT_SIZE = width * 0.85;

const FloatingAvatar: React.FC<{
  name: string;
  initials: string;
  index: number;
  total: number;
  colorIndex: number;
}> = ({ name, initials, index, total, colorIndex }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const enterDelay = 600 + index * 200;
    
    scale.value = withDelay(enterDelay, withSpring(1, { damping: 12, stiffness: 100 }));
    opacity.value = withDelay(enterDelay, withTiming(1, { duration: 400 }));
    
    translateY.value = withDelay(
      enterDelay + 400,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000 + index * 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000 + index * 200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radius = ORBIT_SIZE * 0.35;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const colors = ["#81B29A", "#E07A5F", "#F2CC8F"];
  const bgColor = colors[colorIndex % colors.length];

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          left: ORBIT_SIZE / 2 + x - 28,
          top: ORBIT_SIZE / 2 + y - 28,
          alignItems: "center",
        },
      ]}
    >
      <View style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#F4F1DE",
        padding: 4,
        shadowColor: "#81B29A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <View style={{
          width: "100%",
          height: "100%",
          borderRadius: 24,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 18, color: "#FFF" }}>
            {initials}
          </Text>
        </View>
      </View>
      <View style={{
        backgroundColor: "rgba(255,255,255,0.8)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 4,
      }}>
        <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 10, color: "rgba(61, 64, 91, 0.7)" }}>
          {name.split(" ")[0]}
        </Text>
      </View>
    </Animated.View>
  );
};

const OrbitRing: React.FC<{ size: number; delay: number }> = ({ size, delay }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 80 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "rgba(129, 178, 154, 0.3)",
        },
      ]}
    />
  );
};

const getNextNudgeDate = (orbitId: string): Date => {
  const now = new Date();
  switch (orbitId) {
    case "inner":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "close":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case "catchup":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  }
};

export const OnboardingCompleteScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectedFriends, orbitAssignments, resetOnboarding } = useOnboarding();
  const { completeOnboarding } = useApp();

  const handleEnterTether = () => {
    const now = new Date();
    const tetheredFriends: Friend[] = selectedFriends.map(friend => {
      const orbitId = orbitAssignments[friend.id] || "close";
      return {
        id: friend.id,
        name: friend.name,
        initials: friend.initials,
        photo: friend.photo ?? undefined,
        phone: friend.phone,
        email: friend.email,
        orbitId: orbitId as 'inner' | 'close' | 'catchup',
        lastContact: null,
        nextNudge: getNextNudgeDate(orbitId),
        isFavorite: orbitId === "inner",
        tags: [] as string[],
        streak: 0,
        createdAt: now,
        updatedAt: now,
      };
    });

    completeOnboarding(tetheredFriends);
    resetOnboarding();
    
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  const displayFriends = selectedFriends.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1DE" }} edges={["top", "bottom"]}>
      <Animated.View entering={FadeIn.delay(200).duration(800)} style={{ position: "absolute", top: "15%", left: "10%", width: 12, height: 12, backgroundColor: "#81B29A", borderRadius: 6, opacity: 0.4 }} />
      <Animated.View entering={FadeIn.delay(400).duration(800)} style={{ position: "absolute", top: "12%", right: "20%", width: 8, height: 8, backgroundColor: "#E07A5F", borderRadius: 4, opacity: 0.4 }} />
      <Animated.View entering={FadeIn.delay(600).duration(800)} style={{ position: "absolute", top: "8%", left: "40%", width: 8, height: 8, backgroundColor: "rgba(61, 64, 91, 0.2)", borderRadius: 2, transform: [{ rotate: "12deg" }] }} />
      <Animated.View entering={FadeIn.delay(800).duration(800)} style={{ position: "absolute", top: "20%", right: "10%", width: 12, height: 12, borderWidth: 2, borderColor: "rgba(129, 178, 154, 0.4)", borderRadius: 6 }} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 48, height: 48, alignItems: "flex-start", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="#3D405B" />
          </TouchableOpacity>
          <Animated.Text
            entering={FadeInDown.delay(100).duration(400)}
            style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "rgba(61, 64, 91, 0.6)", letterSpacing: 2, textTransform: "uppercase" }}
          >
            Step 4 of 4
          </Animated.Text>
        </View>

        <View style={{ flex: 1, alignItems: "center", paddingTop: 16 }}>
          <View
            style={{
              width: ORBIT_SIZE,
              height: ORBIT_SIZE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <OrbitRing size={ORBIT_SIZE * 0.9} delay={200} />
            <OrbitRing size={ORBIT_SIZE * 0.55} delay={400} />

            <Animated.View
              entering={ZoomIn.delay(300).duration(500).springify()}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#F4F1DE",
                borderWidth: 4,
                borderColor: "rgba(61, 64, 91, 0.05)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#81B29A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#3D405B",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 16, color: "#F4F1DE" }}>
                  You
                </Text>
              </View>
            </Animated.View>

            {displayFriends.map((friend, index) => (
              <FloatingAvatar
                key={friend.id}
                name={friend.name}
                initials={friend.initials}
                index={index}
                total={displayFriends.length}
                colorIndex={index}
              />
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(1000).duration(600).springify()} style={{ alignItems: "center", marginTop: 16, paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#3D405B", textAlign: "center", lineHeight: 38 }}>
              You're all set!
            </Text>
            <Animated.Text
              entering={FadeInDown.delay(1200).duration(500)}
              style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: "rgba(61, 64, 91, 0.7)", textAlign: "center", marginTop: 16, maxWidth: 280, lineHeight: 24 }}
            >
              We've set your first reminders. We'll nudge you when it's time to reach out.
            </Animated.Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(1400).duration(500)} style={{ paddingHorizontal: 24, paddingBottom: 32, alignItems: "center", gap: 20 }}>
          <TouchableOpacity
            onPress={handleEnterTether}
            activeOpacity={0.9}
            style={{
              width: "100%",
              height: 56,
              backgroundColor: "#E07A5F",
              borderRadius: 9999,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#E07A5F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#F4F1DE" }}>
              Enter Tether
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)" }}>
              Customize Nudge Times
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
