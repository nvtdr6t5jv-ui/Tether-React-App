import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs = [
  { key: "home", label: "Home", icon: "home" as const, iconFilled: "home" as const },
  { key: "people", label: "People", icon: "account-group-outline" as const, iconFilled: "account-group" as const },
  { key: "actions", label: "Actions", icon: "hand-wave-outline" as const, iconFilled: "hand-wave" as const },
  { key: "settings", label: "Settings", icon: "cog-outline" as const, iconFilled: "cog" as const },
];

export const BottomTabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={isActive ? tab.iconFilled : tab.icon}
                size={24}
                color={isActive ? "#81B29A" : "rgba(61, 64, 91, 0.4)"}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? "#81B29A" : "rgba(61, 64, 91, 0.4)",
                    fontFamily: isActive ? "PlusJakartaSans_700Bold" : "PlusJakartaSans_500Medium",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontSize: 10,
  },
});
