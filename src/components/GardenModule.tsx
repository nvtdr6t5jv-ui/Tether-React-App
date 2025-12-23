import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { useGamification } from '../context/GamificationContext';

interface GardenModuleProps {
  onPress: () => void;
}

const STAGE_DATA = [
  { stage: 'seed', icon: 'seed', name: 'Seed', size: 28, color: '#8B6914' },
  { stage: 'sprout', icon: 'sprout', name: 'Sprout', size: 32, color: '#81B29A' },
  { stage: 'growing', icon: 'leaf', name: 'Growing', size: 36, color: '#5A8F7B' },
  { stage: 'blooming', icon: 'flower', name: 'Blooming', size: 40, color: '#E07A5F' },
  { stage: 'flourishing', icon: 'tree', name: 'Flourishing', size: 44, color: '#2D5A47' },
];

export const GardenModule: React.FC<GardenModuleProps> = ({ onPress }) => {
  const { state, streakData } = useGamification();
  const swayAnim = useSharedValue(0);
  const sparkleAnim = useSharedValue(0);

  const currentStreak = streakData.currentStreak || 0;
  const gardenHealth = state.garden?.gardenHealth || 50;
  const level = state.level?.level || 1;
  const totalXP = state.level?.totalXP || 0;

  const getStageIndexByLevel = (lvl: number): number => {
    if (lvl >= 20) return 4;
    if (lvl >= 10) return 3;
    if (lvl >= 5) return 2;
    if (lvl >= 2) return 1;
    return 0;
  };

  const currentStageIndex = getStageIndexByLevel(level);
  const currentStage = STAGE_DATA[currentStageIndex];

  useEffect(() => {
    swayAnim.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2000 }),
        withTiming(3, { duration: 2000 })
      ),
      -1,
      true
    );
    sparkleAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const swayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swayAnim.value}deg` }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleAnim.value,
  }));

  const getHealthColor = () => {
    if (gardenHealth >= 70) return '#81B29A';
    if (gardenHealth >= 40) return '#F2CC8F';
    return '#E07A5F';
  };

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={{
          backgroundColor: '#FFF',
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#3D405B',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            backgroundColor: 'rgba(129, 178, 154, 0.05)',
            borderBottomLeftRadius: 120,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: 'rgba(129, 178, 154, 0.1)',
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <View
              style={{
                position: 'absolute',
                bottom: 8,
                width: 50,
                height: 20,
                backgroundColor: 'rgba(139, 69, 19, 0.2)',
                borderRadius: 10,
              }}
            />
            <Animated.View style={[swayStyle, { alignItems: 'center' }]}>
              <MaterialCommunityIcons 
                name={currentStage.icon as any} 
                size={currentStage.size} 
                color={currentStage.color} 
              />
            </Animated.View>
            {level >= 5 && (
              <Animated.View
                style={[
                  sparkleStyle,
                  {
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  },
                ]}
              >
                <MaterialCommunityIcons name="star-four-points" size={14} color="#F2CC8F" />
              </Animated.View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                Your Garden
              </Text>
              <View
                style={{
                  backgroundColor: 'rgba(129, 178, 154, 0.15)',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 9999,
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: '#81B29A' }}>
                  Lv.{level}
                </Text>
              </View>
            </View>

            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)', marginBottom: 8 }}>
              {currentStage.name}
            </Text>

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="fire" size={14} color="#F59E0B" />
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#3D405B' }}>
                  {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="star" size={14} color="#81B29A" />
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: '#3D405B' }}>
                  {totalXP.toLocaleString()} XP
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: 'rgba(61, 64, 91, 0.5)' }}>
                  Garden Health
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, color: getHealthColor() }}>
                  {gardenHealth}%
                </Text>
              </View>
              <View style={{ height: 4, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${gardenHealth}%`,
                    backgroundColor: getHealthColor(),
                    borderRadius: 2,
                  }}
                />
              </View>
            </View>
          </View>

          <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(61, 64, 91, 0.3)" />
        </View>

        {currentStreak === 0 && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: 'rgba(224, 122, 95, 0.1)',
              padding: 10,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="water" size={16} color="#E07A5F" />
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: '#E07A5F', flex: 1 }}>
              Log a connection to start growing your garden!
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
