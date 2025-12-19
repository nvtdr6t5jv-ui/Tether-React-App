import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { RootStackParamList } from "../navigation/AppNavigator";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const features = [
  {
    icon: "orbit" as const,
    title: "Organize by Orbit",
    description: "Group friends by how close they are to you",
    color: "#E07A5F",
  },
  {
    icon: "bell-ring-outline" as const,
    title: "Gentle Nudges",
    description: "Get reminded before friendships fade",
    color: "#81B29A",
  },
  {
    icon: "chart-line" as const,
    title: "Track Your Connections",
    description: "See your relationship health at a glance",
    color: "#6366F1",
  },
  {
    icon: "message-text-outline" as const,
    title: "Conversation Starters",
    description: "Never run out of things to say",
    color: "#F2CC8F",
  },
];

export const OnboardingValuePreviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const pulseScale = useSharedValue(1);
  const orbitRotation = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    orbitRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1DE" }} edges={["top", "bottom"]}>
      <View style={{ flex: 1 }}>
        <View style={{ alignItems: "center", paddingTop: 24, paddingHorizontal: 24 }}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#3D405B", textAlign: "center", lineHeight: 40 }}>
              Here's what you'll{"\n"}get with Tether
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={{ marginTop: 32, marginBottom: 24, alignItems: "center", justifyContent: "center" }}
          >
            <Animated.View style={[pulseStyle, { position: "relative", width: 140, height: 140 }]}>
              <View style={{ position: "absolute", width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: "rgba(224, 122, 95, 0.15)", borderStyle: "dashed" }} />
              <View style={{ position: "absolute", left: 20, top: 20, width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: "rgba(129, 178, 154, 0.2)", borderStyle: "dashed" }} />
              <View style={{ position: "absolute", left: 40, top: 40, width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: "rgba(61, 64, 91, 0.15)", borderStyle: "dashed" }} />
              <Animated.View style={[orbitStyle, { position: "absolute", width: 140, height: 140 }]}>
                <View style={{ position: "absolute", top: 0, left: 60, width: 20, height: 20, borderRadius: 10, backgroundColor: "#E07A5F" }} />
                <View style={{ position: "absolute", bottom: 20, left: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: "#81B29A" }} />
                <View style={{ position: "absolute", bottom: 10, right: 10, width: 14, height: 14, borderRadius: 7, backgroundColor: "#6366F1" }} />
              </Animated.View>
              <View style={{ position: "absolute", left: 55, top: 55, width: 30, height: 30, borderRadius: 15, backgroundColor: "#3D405B", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#FFF" }}>You</Text>
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInRight.delay(500 + index * 100).duration(400).springify()}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                backgroundColor: "#FFF",
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                shadowColor: "#3D405B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: `${feature.color}15`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons name={feature.icon} size={24} color={feature.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 15, color: "#3D405B" }}>
                  {feature.title}
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 13, color: "rgba(61, 64, 91, 0.6)", marginTop: 2 }}>
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(900).duration(500)} style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("OnboardingSync")}
            activeOpacity={0.9}
            style={{
              width: "100%",
              height: 56,
              backgroundColor: "#E07A5F",
              borderRadius: 9999,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#E07A5F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#F4F1DE" }}>
              Let's Get Started
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#F4F1DE" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
