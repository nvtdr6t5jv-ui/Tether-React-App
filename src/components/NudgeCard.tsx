import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";

export const NudgeCard = () => {
  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(600)}
      className="w-full h-full items-center justify-center"
    >
      <View className="absolute inset-4 bg-white/40 rounded-[2.5rem] -rotate-3 blur-sm" />

      <View className="w-[240px] h-[380px] bg-surface-light rounded-[2.5rem] border-[6px] border-white shadow-lg overflow-hidden">
        <View className="w-full h-6 flex-row justify-between px-4 items-center mt-2 opacity-30">
          <View className="w-8 h-1 bg-text-main rounded-full" />
          <View className="flex-row gap-1">
            <View className="w-1 h-1 rounded-full bg-text-main" />
            <View className="w-1 h-1 rounded-full bg-text-main" />
          </View>
        </View>

        <View className="flex-1 items-center pt-8 px-3">
          <View className="absolute top-20 right-[-20px] w-32 h-32 bg-secondary/5 rounded-full" />

          <Animated.View
            entering={SlideInRight.delay(400).duration(500)}
            className="w-full bg-white rounded-2xl p-4 shadow-md border border-secondary/10"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-lg bg-primary/10 items-center justify-center">
                  <Text className="text-primary text-xs">∞</Text>
                </View>
                <Text className="text-[10px] uppercase font-display-bold text-text-main/50 tracking-wider">
                  Tether
                </Text>
              </View>
              <Text className="text-[10px] text-text-main/40">2m ago</Text>
            </View>

            <View className="flex-row gap-3 items-center">
              <View className="w-10 h-10 rounded-full bg-[#E8E1D3] items-center justify-center border-2 border-white">
                <Text className="font-serif text-text-main font-bold">M</Text>
              </View>
              <View className="flex-1">
                <Text className="font-serif-semibold text-text-main text-sm leading-tight">
                  Say hi to Mark?
                </Text>
                <Text className="text-[10px] text-text-main/70 mt-0.5 leading-snug">
                  It's been a while since you connected.
                </Text>
              </View>
            </View>

            <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-50">
              <View className="h-7 px-3 bg-secondary/10 rounded-full flex-row items-center justify-center gap-1">
                <Text className="text-secondary text-xs">👋</Text>
                <Text className="text-[10px] font-display-bold text-secondary">
                  Wave
                </Text>
              </View>
              <View className="h-7 px-3 border border-gray-100 rounded-full items-center justify-center">
                <Text className="text-[10px] font-display-medium text-text-main/60">
                  Snooze
                </Text>
              </View>
            </View>
          </Animated.View>

          <View className="w-[90%] h-4 bg-white/50 rounded-b-xl mx-auto -mt-1 shadow-sm" />
        </View>
      </View>
    </Animated.View>
  );
};
