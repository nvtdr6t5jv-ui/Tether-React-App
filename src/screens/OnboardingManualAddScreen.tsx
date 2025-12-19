import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
  Layout,
  FadeIn,
} from "react-native-reanimated";
import { useOnboarding } from "../context/OnboardingContext";
import { getInitials, getAvatarColor, Friend } from "../constants/mockData";
import { RootStackParamList } from "../navigation/AppNavigator";
import { FREE_CONTACT_LIMIT } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OnboardingManualAddScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setSelectedFriends } = useOnboarding();
  const [inputs, setInputs] = useState<string[]>(Array(FREE_CONTACT_LIMIT).fill(""));

  useFocusEffect(
    useCallback(() => {
      setInputs(Array(FREE_CONTACT_LIMIT).fill(""));
      setSelectedFriends([]);
    }, [])
  );

  const handleInputChange = (text: string, index: number) => {
    const newInputs = [...inputs];
    newInputs[index] = text;
    setInputs(newInputs);
  };

  const handleRemove = (index: number) => {
    const newInputs = [...inputs];
    newInputs[index] = "";
    setInputs(newInputs);
  };

  const handleNext = () => {
    const friends: Friend[] = [];
    inputs.forEach((input, index) => {
      const name = input.trim();
      if (name && !friends.find(f => f.name.toLowerCase() === name.toLowerCase())) {
        friends.push({
          id: `manual-${Date.now()}-${index}`,
          name,
          photo: null,
          initials: getInitials(name),
        });
      }
    });

    if (friends.length > 0) {
      setSelectedFriends(friends);
      navigation.navigate("OnboardingAssignOrbits");
    }
  };

  const filledCount = inputs.filter(i => i.trim()).length;

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
          <Animated.Text
            entering={FadeInDown.delay(100).duration(400)}
            style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "rgba(61, 64, 91, 0.7)", letterSpacing: 2, textTransform: "uppercase" }}
          >
            Step 2 of 4
          </Animated.Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={{ alignItems: "center", marginBottom: 32 }}>
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#3D405B", textAlign: "center", lineHeight: 36 }}>
              Start with your{"\n"}Inner Circle.
            </Text>
            <Animated.Text
              entering={FadeInDown.delay(400).duration(500)}
              style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: "rgba(61, 64, 91, 0.8)", textAlign: "center", marginTop: 12, maxWidth: 280 }}
            >
              Who are the 3-5 people you want to talk to more often? You can add more later.
            </Animated.Text>
          </Animated.View>
        </View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          contentContainerStyle={{ paddingBottom: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {inputs.map((input, index) => {
            const hasValue = input.trim().length > 0;
            const initials = hasValue ? getInitials(input) : "";
            return (
              <Animated.View
                key={index}
                entering={SlideInRight.delay(300 + index * 80).duration(400).springify()}
                layout={Layout.springify()}
              >
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  backgroundColor: "#FFF",
                  borderRadius: 24,
                  padding: 8,
                  shadowColor: "#3D405B",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  {hasValue ? (
                    <Animated.View
                      entering={ZoomIn.duration(300)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: getAvatarColor(index),
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 16, color: "#FFF" }}>
                        {initials}
                      </Text>
                    </Animated.View>
                  ) : (
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "#F4F1DE",
                      borderWidth: 2,
                      borderStyle: "dashed",
                      borderColor: "rgba(61, 64, 91, 0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <MaterialCommunityIcons name="plus" size={24} color="rgba(61, 64, 91, 0.4)" />
                    </View>
                  )}
                  <TextInput
                    value={input}
                    onChangeText={(text) => handleInputChange(text, index)}
                    placeholder="Name (e.g., Mom)"
                    placeholderTextColor="rgba(61, 64, 91, 0.3)"
                    style={{
                      flex: 1,
                      fontFamily: "PlusJakartaSans_500Medium",
                      fontSize: 18,
                      color: "#3D405B",
                      paddingVertical: 8,
                    }}
                  />
                  {hasValue && (
                    <Animated.View entering={FadeIn.duration(200)}>
                      <TouchableOpacity onPress={() => handleRemove(index)} style={{ padding: 8 }}>
                        <MaterialCommunityIcons name="close" size={20} color="rgba(61, 64, 91, 0.2)" />
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              </Animated.View>
            );
          })}

          <Animated.View entering={FadeIn.delay(700).duration(400)} style={{ paddingVertical: 8 }}>
            <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 13, color: "rgba(61, 64, 91, 0.5)", textAlign: "center" }}>
              Start with up to {FREE_CONTACT_LIMIT} friends. Upgrade anytime for unlimited.
            </Text>
          </Animated.View>
        </ScrollView>

        <Animated.View entering={FadeInUp.delay(800).duration(500)} style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            disabled={filledCount === 0}
            style={{
              width: "100%",
              height: 56,
              backgroundColor: filledCount > 0 ? "#E07A5F" : "rgba(224, 122, 95, 0.4)",
              borderRadius: 9999,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#E07A5F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: filledCount > 0 ? 0.3 : 0,
              shadowRadius: 16,
              elevation: filledCount > 0 ? 6 : 0,
            }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#F4F1DE" }}>
              Next: Assign Orbits
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#F4F1DE" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
