import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from "react-native-reanimated";
import { useOnboarding, OnboardingContact } from "../context/OnboardingContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import { FREE_CONTACT_LIMIT } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OnboardingSelectFriendsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { deviceContacts, selectedFriends, toggleFriendSelection } = useOnboarding();

  const handleNext = () => {
    if (selectedFriends.length > 0) {
      navigation.navigate("OnboardingAssignOrbits");
    }
  };

  const isSelected = (id: string) => selectedFriends.some(f => f.id === id);
  const canSelectMore = selectedFriends.length < FREE_CONTACT_LIMIT;

  const renderContact = useCallback(({ item: contact }: { item: OnboardingContact }) => {
    const selected = isSelected(contact.id);
    const disabled = !selected && !canSelectMore;
    return (
      <TouchableOpacity
        onPress={() => toggleFriendSelection(contact)}
        activeOpacity={0.7}
        disabled={disabled}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: selected ? "#FFF" : "rgba(255,255,255,0.4)",
          borderRadius: 24,
          padding: 12,
          paddingHorizontal: 16,
          marginBottom: 12,
          opacity: disabled ? 0.5 : 1,
          shadowColor: selected ? "#3D405B" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: selected ? 0.05 : 0,
          shadowRadius: 8,
          elevation: selected ? 2 : 0,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {contact.photo ? (
            <Image
              source={{ uri: contact.photo }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: selected ? "rgba(224, 122, 95, 0.2)" : "transparent",
              }}
            />
          ) : (
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(129, 178, 154, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 18, color: "#81B29A" }}>
                {contact.initials}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontFamily: "PlusJakartaSans_600SemiBold",
              fontSize: 18,
              color: selected ? "#3D405B" : "rgba(61, 64, 91, 0.7)",
            }}>
              {contact.name}
            </Text>
            {contact.phone && (
              <Text style={{
                fontFamily: "PlusJakartaSans_400Regular",
                fontSize: 12,
                color: "rgba(61, 64, 91, 0.5)",
                marginTop: 2,
              }}>
                {contact.phone}
              </Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons
          name={selected ? "check-circle" : "checkbox-blank-circle-outline"}
          size={28}
          color={selected ? "#E07A5F" : "rgba(61, 64, 91, 0.2)"}
        />
      </TouchableOpacity>
    );
  }, [selectedFriends, canSelectMore, toggleFriendSelection]);

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

        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={{ alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 32, color: "#3D405B", textAlign: "center", lineHeight: 36 }}>
              Who do you want{"\n"}to tether?
            </Text>
            <Animated.Text
              entering={FadeInDown.delay(400).duration(500)}
              style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 16, color: "rgba(61, 64, 91, 0.8)", textAlign: "center", marginTop: 12, maxWidth: 280 }}
            >
              Select 3-5 friends you want to keep in touch with. You can add more later.
            </Animated.Text>
          </Animated.View>
        </View>

        <FlatList
          data={deviceContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={20}
          windowSize={10}
          extraData={selectedFriends}
        />

        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}>
          <Animated.Text
            layout={Layout.springify()}
            style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: "#3D405B", textAlign: "center", marginBottom: 16 }}
          >
            {selectedFriends.length} of {FREE_CONTACT_LIMIT} Friends Selected
          </Animated.Text>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            disabled={selectedFriends.length === 0}
            style={{
              width: "100%",
              height: 56,
              backgroundColor: selectedFriends.length > 0 ? "#E07A5F" : "rgba(224, 122, 95, 0.4)",
              borderRadius: 9999,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#E07A5F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: selectedFriends.length > 0 ? 0.3 : 0,
              shadowRadius: 16,
              elevation: selectedFriends.length > 0 ? 6 : 0,
            }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: "#F4F1DE" }}>
              Next: Create Orbits
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#F4F1DE" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
