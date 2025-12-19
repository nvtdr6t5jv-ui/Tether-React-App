import React, { useEffect, useCallback } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Friend } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DailyCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  completedCount: number;
  totalGoal: number;
  friends: Friend[];
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  visible,
  onClose,
  completedCount,
  totalGoal,
  friends,
}) => {
  const progress = Math.min((completedCount / totalGoal) * 100, 100);
  const isComplete = completedCount >= totalGoal;
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const getMessage = () => {
    if (isComplete) return "Amazing work! You've hit your daily goal.";
    if (completedCount === 0) return "Start your day by reaching out to someone!";
    if (completedCount < totalGoal / 2) return "Good start! Keep the momentum going.";
    return "Almost there! A few more to go.";
  };

  const getEmoji = () => {
    if (isComplete) return 'trophy';
    if (completedCount === 0) return 'coffee';
    if (completedCount < totalGoal / 2) return 'run';
    return 'fire';
  };

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible]);

  const handleCloseComplete = useCallback(() => {
    onClose();
  }, [onClose]);

  const closeDrawer = useCallback(() => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(handleCloseComplete)();
      }
    });
  }, [handleCloseComplete]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        backdropOpacity.value = interpolate(
          event.translationY,
          [0, 300],
          [1, 0]
        );
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(handleCloseComplete)();
          }
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(61, 64, 91, 0.4)',
            },
            animatedBackdropStyle,
          ]}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={closeDrawer} activeOpacity={1} />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#F4F1DE',
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                padding: 24,
                paddingBottom: 40,
              },
              animatedSheetStyle,
            ]}
          >
            <View style={{ width: 48, height: 6, backgroundColor: 'rgba(61, 64, 91, 0.2)', borderRadius: 3, alignSelf: 'center', marginBottom: 16 }} />
            
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#3D405B', textAlign: 'center', marginBottom: 16 }}>
              Daily Progress
            </Text>

            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Animated.View entering={ZoomIn.delay(200).duration(400)}>
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: isComplete ? 'rgba(129, 178, 154, 0.15)' : 'rgba(249, 115, 22, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <MaterialCommunityIcons
                    name={getEmoji() as any}
                    size={48}
                    color={isComplete ? '#81B29A' : '#F97316'}
                  />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 48, color: '#3D405B' }}>
                  {completedCount}
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 24, color: 'rgba(61, 64, 91, 0.4)' }}>
                    /{totalGoal}
                  </Text>
                </Text>
              </Animated.View>

              <Animated.View entering={FadeIn.delay(400).duration(400)} style={{ width: '100%', marginTop: 20, marginBottom: 16 }}>
                <View
                  style={{
                    height: 12,
                    backgroundColor: 'rgba(61, 64, 91, 0.1)',
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <Animated.View
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: isComplete ? '#81B29A' : '#F97316',
                      borderRadius: 6,
                    }}
                  />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(500).duration(400)}>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: '#3D405B', textAlign: 'center' }}>
                  {getMessage()}
                </Text>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(600).duration(400)} style={{ marginTop: 24, width: '100%' }}>
                <View
                  style={{
                    backgroundColor: 'rgba(61, 64, 91, 0.05)',
                    padding: 16,
                    borderRadius: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: '#81B29A' }}>
                        {friends.length}
                      </Text>
                      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                        Total Friends
                      </Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(61, 64, 91, 0.1)' }} />
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: '#E07A5F' }}>
                        {friends.filter(f => {
                          if (!f.nextNudge) return true;
                          return new Date() > new Date(f.nextNudge);
                        }).length}
                      </Text>
                      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                        Need Attention
                      </Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(61, 64, 91, 0.1)' }} />
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: '#6366F1' }}>
                        {Math.round((completedCount / Math.max(friends.length, 1)) * 100)}%
                      </Text>
                      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                        Reached Today
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};
