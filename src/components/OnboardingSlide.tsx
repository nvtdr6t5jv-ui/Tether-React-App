import React from "react";
import { View, Text, Dimensions } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { TetherLogo } from "./TetherLogo";
import { NudgeCard } from "./NudgeCard";

const { width } = Dimensions.get("window");

interface OnboardingSlideProps {
  slide: {
    id: number;
    title: string;
    titleHighlight: string;
    titleSuffix?: string;
    description: string;
    showGetStarted?: boolean;
    showCreateAccount?: boolean;
  };
  index: number;
  scrollX: SharedValue<number>;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  slide,
  index,
  scrollX,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5]);
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const isNudgeSlide = slide.id === 4;

  return (
    <View className="flex-1 items-center justify-between px-6 pt-12 pb-8" style={{ width }}>
      <View className="items-center w-full mt-8">
        <TetherLogo />

        <Animated.View
          style={animatedStyle}
          className="relative w-full aspect-square max-w-[320px] mt-10 mb-6"
        >
          {isNudgeSlide ? (
            <NudgeCard />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <View className="absolute inset-4 bg-white/40 rounded-3xl rotate-3" />
              <View className="w-full h-full rounded-3xl overflow-hidden bg-surface-light items-center justify-center shadow-lg">
                <View className="w-48 h-48 rounded-full bg-secondary/20 items-center justify-center">
                  <View className="w-32 h-32 rounded-full bg-primary/20 items-center justify-center">
                    <View className="w-16 h-16 rounded-full bg-primary/30" />
                  </View>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      <View className="items-center w-full px-2 mt-2">
        <Animated.Text
          entering={FadeInUp.delay(200).duration(500)}
          className="text-text-main font-serif-semibold text-[40px] leading-[1.1] text-center tracking-tight"
        >
          {slide.title}
          {"\n"}
          <Text className="text-primary italic">{slide.titleHighlight}</Text>
          {slide.titleSuffix && (
            <Text className="text-text-main"> {slide.titleSuffix}</Text>
          )}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(400).duration(500)}
          className="text-text-main/80 font-display text-lg leading-relaxed text-center mt-4 max-w-[280px]"
        >
          {slide.description}
        </Animated.Text>
      </View>
    </View>
  );
};
