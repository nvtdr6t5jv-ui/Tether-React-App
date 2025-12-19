import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

interface SwipeableScreenProps {
  children: React.ReactNode;
  onSwipeBack: () => void;
  enabled?: boolean;
}

export const SwipeableScreen: React.FC<SwipeableScreenProps> = ({
  children,
  onSwipeBack,
  enabled = true,
}) => {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX(20)
    .failOffsetY([-20, 20])
    .enabled(enabled)
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD || event.velocityX > 500) {
        translateX.value = withTiming(width, { duration: 200 }, () => {
          runOnJS(onSwipeBack)();
        });
      } else {
        translateX.value = withTiming(0, { duration: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, width],
      [0, 0.3],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.shadow, shadowStyle]} pointerEvents="none" />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.screen, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#F7F8F6',
  },
  shadow: {
    position: 'absolute',
    top: 0,
    left: -20,
    bottom: 0,
    width: 20,
    backgroundColor: '#000',
  },
});
