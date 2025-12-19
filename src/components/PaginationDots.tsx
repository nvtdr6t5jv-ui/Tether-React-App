import React from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface PaginationDotsProps {
  totalSlides: number;
  scrollX: SharedValue<number>;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  totalSlides,
  scrollX,
}) => {
  return (
    <View className="flex-row items-center gap-2 mb-6">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <Dot key={index} index={index} scrollX={scrollX} />
      ))}
    </View>
  );
};

interface DotProps {
  index: number;
  scrollX: SharedValue<number>;
}

const Dot: React.FC<DotProps> = ({ index, scrollX }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const dotWidth = interpolate(scrollX.value, inputRange, [8, 32, 8], "clamp");
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], "clamp");

    return {
      width: dotWidth,
      opacity,
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className="h-2 rounded-full bg-primary"
    />
  );
};
