import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useOnboarding } from "../context/OnboardingContext";
import { getAvatarColor } from "../constants/mockData";
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

  useEffect(() => {
    translateY.value = withDelay(
      index * 300,
      withRepeat(
        withTiming(-12, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
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

export const OnboardingCompleteScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectedFriends, resetOnboarding } = useOnboarding();

  const handleEnterTether = () => {
    resetOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: "Onboarding" }],
    });
  };

  const displayFriends = selectedFriends.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1DE" }} edges={["top", "bottom"]}>
      <View style={{ position: "absolute", top: "15%", left: "10%", width: 12, height: 12, backgroundColor: "#81B29A", borderRadius: 6, opacity: 0.4 }} />
      <View style={{ position: "absolute", top: "12%", right: "20%", width: 8, height: 8, backgroundColor: "#E07A5F", borderRadius: 4, opacity: 0.4 }} />
      <View style={{ position: "absolute", top: "8%", left: "40%", width: 8, height: 8, backgroundColor: "rgba(61, 64, 91, 0.2)", borderRadius: 2, transform: [{ rotate: "12deg" }] }} />
      <View style={{ position: "absolute", top: "20%", right: "10%", width: 12, height: 12, borderWidth: 2, borderColor: "rgba(129, 178, 154, 0.4)", borderRadius: 6 }} />

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 48, height: 48, alignItems: "flex-start", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="#3D405B" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "rgba(61, 64, 91, 0.6)", letterSpacing: 2, textTransform: "uppercase" }}>
            Step 4 of 4
          </Text>
        </View>

        <View style={{ flex: 1, alignItems: "center", paddingTop: 16 }}>
          <Animated.View
            entering={FadeIn.duration(800)}
            style={{
              width: ORBIT_SIZE,
              height: ORBIT_SIZE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{
              position: "absolute",
              width: ORBIT_SIZE * 0.9,
              height: ORBIT_SIZE * 0.9,
              borderRadius: ORBIT_SIZE * 0.45,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: "rgba(129, 178, 154, 0.3)",
            }} />
            <View style={{
              position: "absolute",
              width: ORBIT_SIZE * 0.55,
              height: ORBIT_SIZE * 0.55,
              borderRadius: ORBIT_SIZE * 0.275,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: "rgba(129, 178, 154, 0.3)",
            }} />

            <View style={{
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
            }}>
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
            </View>

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
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={{ alignItems: "center", marginTop: 16, paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#3D405B", textAlign: "center", lineHeight: 38 }}>
              You're all set!
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: "rgba(61, 64, 91, 0.7)", textAlign: "center", marginTop: 16, maxWidth: 280, lineHeight: 24 }}>
              We've set your first reminders. We'll nudge you when it's time to reach out.
            </Text>
          </Animated.View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 32, alignItems: "center", gap: 20 }}>
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
        </View>
      </View>
    </SafeAreaView>
  );
};
