import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useOnboarding, OnboardingContact } from "../context/OnboardingContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const OnboardingSyncScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setSyncMode, setDeviceContacts } = useOnboarding();
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const cardScale = useSharedValue(1);
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      containerOpacity.value = withTiming(1, { duration: 50 });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const fetchContacts = async (): Promise<OnboardingContact[]> => {
    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Image,
      ],
      sort: Contacts.SortTypes.FirstName,
    });

    return data
      .filter(contact => contact.name && contact.name.trim().length > 0)
      .map(contact => {
        let photoUri = contact.image?.uri || null;
        if (photoUri && !photoUri.startsWith('file://')) {
          photoUri = `file://${photoUri}`;
        }
        return {
          id: contact.id || `contact-${Date.now()}-${Math.random()}`,
          name: contact.name || "Unknown",
          initials: getInitials(contact.name || "UN"),
          phone: contact.phoneNumbers?.[0]?.number,
          email: contact.emails?.[0]?.email,
          photo: photoUri,
        };
      })
      .slice(0, 100);
  };

  const handleContinue = async () => {
    if (syncEnabled) {
      setIsLoading(true);
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        
        if (status === "granted") {
          const contacts = await fetchContacts();
          
          if (contacts.length === 0) {
            Alert.alert(
              "No Contacts Found",
              "We couldn't find any contacts on your device. Would you like to add friends manually?",
              [
                { text: "Add Manually", onPress: () => {
                  setSyncMode("manual");
                  navigation.navigate("OnboardingManualAdd");
                }},
                { text: "Cancel", style: "cancel" },
              ]
            );
          } else {
            setDeviceContacts(contacts);
            setSyncMode("contacts");
            navigation.navigate("OnboardingSelectFriends");
          }
        } else {
          Alert.alert(
            "Permission Required",
            "Tether needs access to your contacts to help you find friends. You can also add friends manually.",
            [
              { text: "Add Manually", onPress: () => {
                setSyncMode("manual");
                navigation.navigate("OnboardingManualAdd");
              }},
              { text: "Try Again", onPress: handleContinue },
            ]
          );
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        Alert.alert(
          "Error",
          "Something went wrong while accessing your contacts. Please try again or add friends manually.",
          [
            { text: "Add Manually", onPress: () => {
              setSyncMode("manual");
              navigation.navigate("OnboardingManualAdd");
            }},
            { text: "Try Again", onPress: handleContinue },
          ]
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      setSyncMode("manual");
      navigation.navigate("OnboardingManualAdd");
    }
  };

  const handlePressIn = () => {
    cardScale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (!isReady) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1DE" }} edges={["top", "bottom"]} />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F1DE" }} edges={["top", "bottom"]}>
      <Animated.View style={[{ flex: 1 }, containerStyle]}>
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
            Step 1 of 4
          </Animated.Text>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={{ alignItems: "center", marginBottom: 40 }}>
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 36, color: "#3D405B", textAlign: "center", lineHeight: 40 }}>
              Let's find your{"\n"}people.
            </Text>
            <Animated.Text
              entering={FadeInDown.delay(400).duration(500)}
              style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: "rgba(61, 64, 91, 0.8)", textAlign: "center", marginTop: 16, maxWidth: 280, lineHeight: 24 }}
            >
              Tether helps you stay close to the friends who matter most. Sync your contacts to get started instantly.
            </Animated.Text>
          </Animated.View>

          <Animated.View entering={SlideInRight.delay(500).duration(500).springify()}>
            <Animated.View
              style={[cardAnimatedStyle, {
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
              }]}
            >
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
                disabled={isLoading}
              />
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(700).duration(500)} style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={handleContinue}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            disabled={isLoading}
            style={{
              width: "100%",
              height: 56,
              backgroundColor: isLoading ? "rgba(224, 122, 95, 0.6)" : "#E07A5F",
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
            {isLoading ? (
              <ActivityIndicator color="#F4F1DE" />
            ) : (
              <>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#F4F1DE" }}>
                  Continue
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#F4F1DE" />
              </>
            )}
          </TouchableOpacity>
          <Animated.Text
            entering={FadeInUp.delay(900).duration(400)}
            style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 10, color: "rgba(61, 64, 91, 0.4)", textAlign: "center", marginTop: 16, paddingHorizontal: 32 }}
          >
            By syncing, you agree to allow Tether to access your contact list securely. We never spam your friends.
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};
