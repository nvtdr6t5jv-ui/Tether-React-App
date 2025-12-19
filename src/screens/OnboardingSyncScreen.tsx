import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useOnboarding } from "../context/OnboardingContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OnboardingSyncScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setSyncMode } = useOnboarding();
  const [syncEnabled, setSyncEnabled] = useState(true);

  const handleContinue = () => {
    if (syncEnabled) {
      setSyncMode("contacts");
      navigation.navigate("OnboardingSelectFriends");
    } else {
      setSyncMode("manual");
      navigation.navigate("OnboardingManualAdd");
    }
  };

  const handleManualAdd = () => {
    setSyncMode("manual");
    navigation.navigate("OnboardingManualAdd");
  };

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
            Step 1 of 4
          </Text>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: "center", marginBottom: 40 }}>
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 36, color: "#3D405B", textAlign: "center", lineHeight: 40 }}>
              Let's find your{"\n"}people.
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: "rgba(61, 64, 91, 0.8)", textAlign: "center", marginTop: 16, maxWidth: 280, lineHeight: 24 }}>
              Tether helps you stay close to the friends who matter most. Sync your contacts to get started instantly.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <View style={{
              backgroundColor: "#FFF",
              borderRadius: 24,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              shadowColor: "#3D405B",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              marginBottom: 24,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: "#F4F1DE",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <MaterialCommunityIcons name="contacts" size={28} color="#E07A5F" />
                </View>
                <View>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#3D405B" }}>
                    Sync Contacts
                  </Text>
                  <Text style={{ fontFamily: "PlusJakartaSans_500Medium", fontSize: 12, color: "rgba(61, 64, 91, 0.6)", marginTop: 2 }}>
                    Find friends automatically
                  </Text>
                </View>
              </View>
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
                trackColor={{ false: "#E0E0E0", true: "#E07A5F" }}
                thumbColor="#FFF"
                ios_backgroundColor="#E0E0E0"
              />
            </View>

            <View style={{ alignItems: "center", flex: 1 }}>
              <TouchableOpacity
                onPress={handleManualAdd}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  borderRadius: 9999,
                  borderWidth: 2,
                  borderColor: "rgba(129, 178, 154, 0.5)",
                }}
              >
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#81B29A" }}>
                  I'll add friends manually
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={handleContinue}
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
              Continue
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#F4F1DE" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 10, color: "rgba(61, 64, 91, 0.4)", textAlign: "center", marginTop: 16, paddingHorizontal: 32 }}>
            By syncing, you agree to allow Tether to access your contact list securely. We never spam your friends.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
