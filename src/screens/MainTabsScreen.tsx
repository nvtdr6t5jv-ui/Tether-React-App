import React, { useState } from "react";
import { View } from "react-native";
import { HomeScreen } from "../screens/HomeScreen";
import { BottomTabBar } from "../components/BottomTabBar";

export const MainTabsScreen = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "people":
        return <PlaceholderScreen title="People" />;
      case "actions":
        return <PlaceholderScreen title="Actions" />;
      case "settings":
        return <PlaceholderScreen title="Settings" />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F8F6" }}>
      {renderScreen()}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
};

import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F6", alignItems: "center", justifyContent: "center" }}>
    <MaterialCommunityIcons name="hammer-wrench" size={48} color="rgba(61, 64, 91, 0.3)" />
    <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 20, color: "#3D405B", marginTop: 16 }}>
      {title}
    </Text>
    <Text style={{ fontFamily: "PlusJakartaSans_400Regular", fontSize: 14, color: "rgba(61, 64, 91, 0.6)", marginTop: 4 }}>
      Coming soon
    </Text>
  </SafeAreaView>
);
