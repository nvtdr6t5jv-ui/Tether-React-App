import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const TetherLogo = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
    >
      <MaterialCommunityIcons name="infinity" size={28} color="#E07A5F" />
      <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 24, color: "#E07A5F", letterSpacing: -0.5 }}>
        Tether
      </Text>
    </Animated.View>
  );
};
