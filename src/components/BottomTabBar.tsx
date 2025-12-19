import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

interface TabBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs = [
  { key: "people", label: "People", icon: "account-group-outline" as const, iconFilled: "account-group" as const },
  { key: "today", label: "Today", icon: "calendar-today" as const, iconFilled: "calendar-today" as const },
  { key: "calendar", label: "Calendar", icon: "calendar-month-outline" as const, iconFilled: "calendar-month" as const },
  { key: "insights", label: "Insights", icon: "chart-line" as const, iconFilled: "chart-line" as const },
  { key: "settings", label: "Settings", icon: "cog-outline" as const, iconFilled: "cog" as const },
];

const AnimatedTab: React.FC<{
  tab: typeof tabs[0];
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tab}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <MaterialCommunityIcons
          name={isActive ? tab.iconFilled : tab.icon}
          size={22}
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
      </Animated.View>
    </TouchableOpacity>
  );
};

export const BottomTabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <AnimatedTab
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={() => onTabPress(tab.key)}
          />
        ))}
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
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 4,
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
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontSize: 9,
  },
});
