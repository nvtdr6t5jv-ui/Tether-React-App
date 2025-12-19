import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import { ORBITS } from '../types';

const { width } = Dimensions.get('window');

interface AnalyticsScreenProps {
  onBack: () => void;
}

const CircleProgress: React.FC<{
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  bgColor?: string;
}> = ({ percentage, size, strokeWidth, color, bgColor = 'rgba(0,0,0,0.05)' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: percentage > 25 ? color : 'transparent',
          borderBottomColor: percentage > 50 ? color : 'transparent',
          borderLeftColor: percentage > 75 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
    </View>
  );
};

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}> = ({ icon, label, value, color, bgColor }) => (
  <View
    style={{
      backgroundColor: '#FFF',
      borderRadius: 16,
      padding: 16,
      flex: 1,
      shadowColor: '#3D405B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    }}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      }}
    >
      <MaterialCommunityIcons name={icon as any} size={20} color={color} />
    </View>
    <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: '#3D405B' }}>
      {value}
    </Text>
    <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)', marginTop: 2 }}>
      {label}
    </Text>
  </View>
);

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onBack }) => {
  const { getSocialHealthStats, friends, interactions } = useApp();

  const stats = useMemo(() => getSocialHealthStats(), [getSocialHealthStats, friends, interactions]);

  const getHealthColor = (health: number): string => {
    if (health >= 80) return '#81B29A';
    if (health >= 50) return '#E9C46A';
    return '#E07A5F';
  };

  const orbitsWithCounts = useMemo(() => {
    return ORBITS.map(orbit => ({
      ...orbit,
      count: friends.filter(f => f.orbitId === orbit.id).length,
      health: orbit.id === 'inner' ? stats.innerCircleHealth :
              orbit.id === 'close' ? stats.closeCircleHealth :
              stats.catchupCircleHealth,
    }));
  }, [friends, stats]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ padding: 8, marginLeft: -8, borderRadius: 20 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#3D405B" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
          Social Stats
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            backgroundColor: '#FFF',
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            marginBottom: 24,
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 4,
          }}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
            Overall Health
          </Text>
          
          <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                borderWidth: 12,
                borderColor: 'rgba(0,0,0,0.03)',
                position: 'relative',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -12,
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  borderWidth: 12,
                  borderColor: getHealthColor(stats.overallScore),
                  borderTopColor: 'transparent',
                  borderRightColor: stats.overallScore > 25 ? getHealthColor(stats.overallScore) : 'transparent',
                  borderBottomColor: stats.overallScore > 50 ? getHealthColor(stats.overallScore) : 'transparent',
                  borderLeftColor: stats.overallScore > 75 ? getHealthColor(stats.overallScore) : 'transparent',
                  transform: [{ rotate: `${-90 + (stats.overallScore * 3.6)}deg` }],
                }}
              />
            </View>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 48, color: '#3D405B' }}>
                {stats.overallScore}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: getHealthColor(stats.overallScore) }}>
                {stats.overallScore >= 80 ? 'Excellent' : stats.overallScore >= 50 ? 'Good' : 'Needs Work'}
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', textAlign: 'center', marginTop: 20, lineHeight: 20 }}>
            {stats.overallScore >= 80 
              ? "You're doing great at staying connected with your people!"
              : stats.overallScore >= 50
              ? "You're on the right track. A few more check-ins would help!"
              : "Time to reconnect! Your friends miss you."}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8, marginBottom: 12 }}>
            Orbit Health
          </Text>
          <View style={{ gap: 12, marginBottom: 24 }}>
            {orbitsWithCounts.map((orbit, index) => (
              <Animated.View
                key={orbit.id}
                entering={FadeIn.delay(300 + index * 100).duration(300)}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  shadowColor: '#3D405B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${orbit.color}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: orbit.color }}>
                    {orbit.count}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                    {orbit.name}
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)' }}>
                    {orbit.frequency} check-ins
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: getHealthColor(orbit.health) }}>
                    {orbit.health}%
                  </Text>
                  <View
                    style={{
                      width: 60,
                      height: 6,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      marginTop: 4,
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${orbit.health}%`,
                        backgroundColor: getHealthColor(orbit.health),
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: 'rgba(61, 64, 91, 0.5)', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 8, marginBottom: 12 }}>
            Activity
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <StatCard
              icon="calendar-week"
              label="This Week"
              value={stats.connectionsThisWeek}
              color="#81B29A"
              bgColor="rgba(129, 178, 154, 0.1)"
            />
            <StatCard
              icon="calendar-month"
              label="This Month"
              value={stats.connectionsThisMonth}
              color="#3B82F6"
              bgColor="rgba(59, 130, 246, 0.1)"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard
              icon="fire"
              label="Best Streak"
              value={stats.longestStreak}
              color="#E07A5F"
              bgColor="rgba(224, 122, 95, 0.1)"
            />
            <StatCard
              icon="alert-circle"
              label="Overdue"
              value={stats.overdueCount}
              color={stats.overdueCount > 0 ? '#E07A5F' : '#81B29A'}
              bgColor={stats.overdueCount > 0 ? 'rgba(224, 122, 95, 0.1)' : 'rgba(129, 178, 154, 0.1)'}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(700).duration(400)} style={{ marginTop: 24 }}>
          <View
            style={{
              backgroundColor: '#F4F1DE',
              borderRadius: 16,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="chart-timeline-variant" size={32} color="rgba(61, 64, 91, 0.3)" />
            <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', textAlign: 'center', marginTop: 12 }}>
              More detailed analytics coming soon!
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
