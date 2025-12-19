import React from "react";
import { View, Text, Dimensions } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { TetherLogo } from "./TetherLogo";
import { NudgeCard } from "./NudgeCard";

const { width, height } = Dimensions.get("window");

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
  const imageSize = Math.min(width * 0.75, 280);

  return (
    <View style={{ width, height: height - 180 }} className="items-center px-6 pt-12">
      <View className="items-center w-full">
        <TetherLogo />

        <Animated.View
          style={[animatedStyle, { width: imageSize, height: imageSize, marginTop: 24, marginBottom: 16 }]}
          className="relative"
        >
          {isNudgeSlide ? (
            <NudgeCard />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <View className="absolute inset-2 bg-white/40 rounded-3xl rotate-3" />
              <View className="w-full h-full rounded-3xl overflow-hidden bg-surface-light items-center justify-center"
                style={{
                  shadowColor: "#3D405B",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.1,
                  shadowRadius: 40,
                  elevation: 5,
                }}
              >
                <View className="w-40 h-40 rounded-full bg-secondary/20 items-center justify-center">
                  <View className="w-28 h-28 rounded-full bg-primary/20 items-center justify-center">
                    <View className="w-14 h-14 rounded-full bg-primary/30" />
                  </View>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      <View className="items-center w-full px-2">
        <Text className="text-text-main font-serif-semibold text-[36px] leading-[44px] text-center tracking-tight">
          {slide.title}{"\n"}
          <Text className="text-primary italic">{slide.titleHighlight}</Text>
          {slide.titleSuffix && (
            <Text className="text-text-main"> {slide.titleSuffix}</Text>
          )}
        </Text>

        <Text className="text-text-main/80 font-display text-base leading-relaxed text-center mt-3 max-w-[280px]">
          {slide.description}
        </Text>
      </View>
    </View>
  );
};
