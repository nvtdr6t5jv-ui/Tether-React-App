import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp, FadeOutLeft, FadeInRight } from "react-native-reanimated";
import { useOnboarding } from "../context/OnboardingContext";
import { orbits, getAvatarColor } from "../constants/mockData";
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

  useEffect(() => {
    if (currentFriend) {
      setSelectedOrbit(orbitAssignments[currentFriend.id] || null);
      setKey(prev => prev + 1);
    }
  }, [currentFriendIndex, currentFriend]);

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

  const progress = ((currentFriendIndex + 1) / selectedFriends.length) * 100;

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

        <View style={{ height: 4, backgroundColor: "rgba(61, 64, 91, 0.1)", marginHorizontal: 24 }}>
          <View style={{ height: "100%", width: `${progress}%`, backgroundColor: "#E07A5F", borderRadius: 2 }} />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#3D405B", textAlign: "center", lineHeight: 36, marginBottom: 24 }}>
            How often do you{"\n"}want to chat?
          </Text>

          <Animated.View
            key={key}
            entering={FadeInRight.duration(300)}
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
              <Image
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
              <View style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "rgba(129, 178, 154, 0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 4,
                borderColor: "rgba(129, 178, 154, 0.1)",
              }}>
                <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#81B29A" }}>
                  {currentFriend.initials}
                </Text>
              </View>
            )}
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 24, color: "#3D405B" }}>
              {currentFriend.name}
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 14, color: "rgba(61, 64, 91, 0.6)", marginTop: 4 }}>
              {currentFriendIndex + 1} of {selectedFriends.length}
            </Text>
          </Animated.View>

          <View style={{ gap: 12 }}>
            {orbits.map((orbit, index) => {
              const isSelected = selectedOrbit === orbit.id;
              return (
                <TouchableOpacity
                  key={orbit.id}
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
              );
            })}
          </View>

          <TouchableOpacity onPress={handleSkip} style={{ alignItems: "center", marginTop: 24 }}>
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 16, color: "rgba(61, 64, 91, 0.6)" }}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}>
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
        </View>
      </View>
    </SafeAreaView>
  );
};
