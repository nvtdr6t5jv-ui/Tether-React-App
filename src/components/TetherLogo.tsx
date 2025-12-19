import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export const TetherLogo = () => {
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      className="flex-row items-center gap-2"
    >
      <Text className="text-primary text-3xl">∞</Text>
      <Text className="font-serif-semibold text-2xl text-primary tracking-tight">
        Tether
      </Text>
    </Animated.View>
  );
};
