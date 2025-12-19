import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useOnboarding } from "../context/OnboardingContext";
import { ORBITS } from "../types";

const orbits = ORBITS.map(o => ({ id: o.id, label: o.name, frequency: o.frequency }));
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OnboardingAssignOrbitsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    selectedFriends,
    currentFriend,
    currentFriendIndex,
    isLastFriend,
    assignOrbit,
    nextFriend,
    orbitAssignments,
  } = useOnboarding();

  const [selectedOrbit, setSelectedOrbit] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (currentFriend) {
      setSelectedOrbit(orbitAssignments[currentFriend.id] || null);
      setKey(prev => prev + 1);
    }
  }, [currentFriendIndex, currentFriend]);

  useEffect(() => {
    const progress = ((currentFriendIndex + 1) / selectedFriends.length) * 100;
    progressWidth.value = withSpring(progress, { damping: 15, stiffness: 100 });
  }, [currentFriendIndex, selectedFriends.length]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleOrbitSelect = (orbitId: string) => {
    setSelectedOrbit(orbitId);
    if (currentFriend) {
      assignOrbit(currentFriend.id, orbitId);
    }
  };

  const handleNext = () => {
    const isComplete = nextFriend();
    if (isComplete) {
      navigation.navigate("OnboardingComplete");
    }
  };

  const handleSkip = () => {
    const isComplete = nextFriend();
    if (isComplete) {
      navigation.navigate("OnboardingComplete");
    }
  };

  if (!currentFriend) {
    navigation.navigate("OnboardingComplete");
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1DE" }} edges={["top", "bottom"]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 48, height: 48, alignItems: "flex-start", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="#3D405B" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "rgba(61, 64, 91, 0.7)", letterSpacing: 2, textTransform: "uppercase" }}>
            Step 3 of 4
          </Text>
        </View>

        <View style={{ height: 4, backgroundColor: "rgba(61, 64, 91, 0.1)", marginHorizontal: 24, borderRadius: 2, overflow: "hidden" }}>
          <Animated.View style={[progressStyle, { height: "100%", backgroundColor: "#E07A5F", borderRadius: 2 }]} />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          <Animated.Text
            entering={FadeInDown.duration(500)}
            style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 28, color: "#3D405B", textAlign: "center", lineHeight: 36, marginBottom: 16 }}
          >
            How often do you want to chat?
          </Animated.Text>

          <Animated.View
            key={key}
            entering={SlideInRight.duration(400).springify()}
            exiting={SlideOutLeft.duration(300)}
            style={{
              backgroundColor: "#FFF",
              borderRadius: 24,
              padding: 32,
              alignItems: "center",
              shadowColor: "#3D405B",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
              marginBottom: 24,
            }}
          >
            {currentFriend.photo ? (
              <Animated.Image
                entering={ZoomIn.delay(150).duration(400)}
                source={{ uri: currentFriend.photo }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  marginBottom: 16,
                  borderWidth: 4,
                  borderColor: "rgba(129, 178, 154, 0.1)",
                }}
              />
            ) : (
              <Animated.View
                entering={ZoomIn.delay(150).duration(400)}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: "rgba(129, 178, 154, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  borderWidth: 4,
                  borderColor: "rgba(129, 178, 154, 0.1)",
                }}
              >
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#81B29A" }}>
                  {currentFriend.initials}
                </Text>
              </Animated.View>
            )}
            <Animated.Text
              entering={FadeIn.delay(250).duration(300)}
              style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 24, color: "#3D405B" }}
            >
              {currentFriend.name}
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(350).duration(300)}
              style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)", marginTop: 4 }}
            >
              {currentFriendIndex + 1} of {selectedFriends.length}
            </Animated.Text>
          </Animated.View>

          <View style={{ gap: 12 }}>
            {orbits.map((orbit, index) => {
              const isSelected = selectedOrbit === orbit.id;
              return (
                <Animated.View
                  key={orbit.id}
                  entering={SlideInRight.delay(400 + index * 100).duration(400).springify()}
                  layout={Layout.springify()}
                >
                  <TouchableOpacity
                    onPress={() => handleOrbitSelect(orbit.id)}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isSelected ? "#81B29A" : "#FFF",
                      borderRadius: 32,
                      padding: 16,
                      paddingHorizontal: 24,
                      shadowColor: isSelected ? "#81B29A" : "#3D405B",
                      shadowOffset: { width: 0, height: isSelected ? 8 : 2 },
                      shadowOpacity: isSelected ? 0.3 : 0.05,
                      shadowRadius: isSelected ? 16 : 8,
                      elevation: isSelected ? 6 : 2,
                    }}
                  >
                    <Text style={{
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontSize: 16,
                      color: isSelected ? "#FFF" : "#3D405B",
                    }}>
                      {orbit.label}
                    </Text>
                    <View style={{
                      backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "#F4F1DE",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                    }}>
                      <Text style={{
                        fontFamily: "PlusJakartaSans_500Medium",
                        fontSize: 12,
                        color: isSelected ? "rgba(255,255,255,0.9)" : "rgba(61, 64, 91, 0.5)",
                      }}>
                        {orbit.frequency}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <Animated.View entering={FadeIn.delay(800).duration(400)}>
            <TouchableOpacity onPress={handleSkip} style={{ alignItems: "center", marginTop: 24 }}>
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 16, color: "rgba(61, 64, 91, 0.6)" }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(600).duration(500)} style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}>
          <TouchableOpacity
            onPress={handleNext}
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
              {isLastFriend ? "Finish" : "Next Friend"}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#F4F1DE" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
