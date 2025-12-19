import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { DrawerModal } from './DrawerModal';
import { Friend } from '../types';

const { width } = Dimensions.get('window');

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

  return (
    <DrawerModal visible={visible} onClose={onClose} title="Daily Progress">
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
              backgroundColor: '#F4F1DE',
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
              backgroundColor: '#F4F1DE',
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
    </DrawerModal>
  );
};