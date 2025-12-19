import React from "react";
import { View, Text, Dimensions } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  SharedValue,
  Extrapolation,
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
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.7, 1, 0.7], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [30, 0, 30], Extrapolation.CLAMP);
    const rotate = interpolate(scrollX.value, inputRange, [-10, 0, 10], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [
        { scale },
        { translateY },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const translateX = interpolate(scrollX.value, inputRange, [-50, 0, 50], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [20, 0, 20], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateX }, { translateY }],
    };
  });

  const descriptionAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [30, 0, 30], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const isNudgeSlide = slide.id === 4;
  const imageSize = Math.min(width * 0.65, 240);

  return (
    <View style={{ width, height: height - 180, alignItems: "center", paddingHorizontal: 24, paddingTop: 48 }}>
      <View style={{ alignItems: "center", width: "100%" }}>
        <TetherLogo />

        <Animated.View
          style={[imageAnimatedStyle, { width: imageSize, height: imageSize, marginTop: 32, marginBottom: 24 }]}
        >
          {isNudgeSlide ? (
            <NudgeCard />
          ) : (
            <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              <View style={{ position: "absolute", left: 8, right: 8, top: 8, bottom: 8, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 24, transform: [{ rotate: "3deg" }] }} />
              <View style={{
                width: "100%",
                height: "100%",
                borderRadius: 24,
                overflow: "hidden",
                backgroundColor: "#FDFCF8",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#3D405B",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 40,
                elevation: 5,
              }}>
                <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(129, 178, 154, 0.2)", alignItems: "center", justifyContent: "center" }}>
                  <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(224, 122, 95, 0.2)", alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(224, 122, 95, 0.3)" }} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      <View style={{ alignItems: "center", width: "100%", paddingHorizontal: 8 }}>
        <Animated.Text
          style={[
            titleAnimatedStyle,
            {
              fontFamily: "Fraunces_600SemiBold",
              fontSize: 34,
              lineHeight: 42,
              color: "#3D405B",
              textAlign: "center",
              letterSpacing: -0.5,
            }
          ]}
        >
          {slide.title}{"\n"}
          <Text style={{ color: "#E07A5F", fontStyle: "italic" }}>{slide.titleHighlight}</Text>
          {slide.titleSuffix && (
            <Text style={{ color: "#3D405B" }}> {slide.titleSuffix}</Text>
          )}
        </Animated.Text>

        <Animated.Text
          style={[
            descriptionAnimatedStyle,
            {
              fontFamily: "PlusJakartaSans_400Regular",
              fontSize: 16,
              lineHeight: 24,
              color: "rgba(61, 64, 91, 0.8)",
              textAlign: "center",
              marginTop: 16,
              maxWidth: 280,
            }
          ]}
        >
          {slide.description}
        </Animated.Text>
      </View>
    </View>
  );
};
