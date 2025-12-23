import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import Svg, { Circle } from 'react-native-svg';
import { ORBITS } from '../types';
import { GardenModule } from '../components/GardenModule';

interface InsightsScreenProps {
  onPremiumRequired?: () => void;
  onNavigateToProfile?: (friendId: string) => void;
  onNavigateToGarden?: () => void;
}

const ProgressRing: React.FC<{
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
}> = ({ percentage, size, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const MetricRow: React.FC<{
  icon: string;
  label: string;
  status: string;
  statusColor: string;
  statusBg: string;
}> = ({ icon, label, status, statusColor, statusBg }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: statusBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons name={icon as any} size={12} color="#FFF" />
    </View>
    <View>
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#3D405B' }}>
        {label}
      </Text>
      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: statusColor }}>
        {status}
      </Text>
    </View>
  </View>
);

const OrbitBar: React.FC<{
  name: string;
  actual: number;
  goal: number;
  status: string;
  statusColor: string;
  barColor: string;
}> = ({ name, actual, goal, status, statusColor, barColor }) => (
  <View style={{ gap: 6 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
        {name}
      </Text>
      <View
        style={{
          backgroundColor: `${statusColor}15`,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 9999,
        }}
      >
        <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: statusColor }}>
          {status}
        </Text>
      </View>
    </View>
    <View
      style={{
        height: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
      />
      <View
        style={{
          height: '100%',
          width: `${Math.min(actual, 100)}%`,
          backgroundColor: barColor,
          borderRadius: 6,
        }}
      />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: 'rgba(0,0,0,0.3)' }}>
        {actual < 100 ? `${actual}%` : 'Actual'}
      </Text>
      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: 'rgba(0,0,0,0.3)' }}>
        Goal
      </Text>
    </View>
  </View>
);

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ onPremiumRequired, onNavigateToProfile, onNavigateToGarden }) => {
  const { getSocialHealthStats, friends, interactions, premiumStatus, getOverdueFriends } = useApp();

  const stats = useMemo(() => getSocialHealthStats(), [getSocialHealthStats, friends, interactions]);
  const overdueFriends = getOverdueFriends();

  const connectionTypes = useMemo(() => {
    const total = interactions.length || 1;
    const texts = interactions.filter(i => i.type === 'text').length;
    const calls = interactions.filter(i => i.type === 'call').length;
    const inPerson = interactions.filter(i => i.type === 'in_person').length;
    
    return {
      texting: Math.round((texts / total) * 100) || 70,
      calls: Math.round((calls / total) * 100) || 20,
      inPerson: Math.round((inPerson / total) * 100) || 10,
    };
  }, [interactions]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My Social Pulse Score: ${stats.overallScore}%! I'm keeping up with my relationships using Tether.`,
      });
    } catch (error) {}
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Great';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const orbitStats = useMemo(() => {
    return ORBITS.map(orbit => {
      const orbitFriends = friends.filter(f => f.orbitId === orbit.id);
      const overdueInOrbit = overdueFriends.filter(f => f.orbitId === orbit.id);
      return {
        ...orbit,
        total: orbitFriends.length,
        overdue: overdueInOrbit.length,
      };
    });
  }, [friends, overdueFriends]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#3D405B' }}>
          Insights
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFF',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <MaterialCommunityIcons name="export-variant" size={20} color="#3D405B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {onNavigateToGarden && (
          <GardenModule onPress={onNavigateToGarden} />
        )}

        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            backgroundColor: '#FFF',
            borderRadius: 20,
            padding: 24,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 24,
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <View style={{ position: 'relative', width: 120, height: 120 }}>
            <ProgressRing
              percentage={stats.overallScore}
              size={120}
              strokeWidth={10}
              color="#81B29A"
            />
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#3D405B' }}>
                {stats.overallScore}%
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#81B29A', textTransform: 'uppercase' }}>
                {getHealthLabel(stats.overallScore)}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1, gap: 12 }}>
            <MetricRow
              icon="check"
              label="Consistency"
              status={stats.overallScore >= 70 ? 'High' : 'Moderate'}
              statusColor="#81B29A"
              statusBg="#81B29A"
            />
            <MetricRow
              icon="check"
              label="Orbit Balance"
              status={stats.overallScore >= 60 ? 'Good' : 'Needs Work'}
              statusColor="#81B29A"
              statusBg="#81B29A"
            />
            <MetricRow
              icon="minus"
              label="Depth"
              status="Needs Focus"
              statusColor="#F2CC8F"
              statusBg="#F2CC8F"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginBottom: 12, paddingHorizontal: 4 }}>
            This Week
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF',
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                shadowColor: '#3D405B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 32, color: '#81B29A' }}>
                {stats.connectionsThisWeek}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                Connections
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF',
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                shadowColor: '#3D405B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 32, color: '#E07A5F' }}>
                {stats.currentStreak}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                Day Streak
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF',
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                shadowColor: '#3D405B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 32, color: '#3D405B' }}>
                {stats.overdueCount}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                Overdue
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginBottom: 12, paddingHorizontal: 4 }}>
            Orbit Balance
          </Text>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 20,
              padding: 20,
              gap: 20,
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {!premiumStatus.isPremium && (
              <TouchableOpacity
                onPress={onPremiumRequired}
                activeOpacity={0.95}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.97)',
                  zIndex: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 20,
                }}
              >
                <View style={{ alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(129, 178, 154, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="lock" size={24} color="#81B29A" />
                  </View>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                    Unlock Detailed Analytics
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: 'rgba(61, 64, 91, 0.6)', textAlign: 'center' }}>
                    See your orbit breakdown with Premium
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <OrbitBar
              name="Favorites"
              actual={stats.innerCircleHealth}
              goal={100}
              status={stats.innerCircleHealth >= 80 ? 'On Track' : stats.overdueCount > 0 ? `${Math.min(stats.overdueCount, 3)} Overdue` : 'On Track'}
              statusColor={stats.innerCircleHealth >= 80 ? '#81B29A' : '#F2CC8F'}
              barColor={stats.innerCircleHealth >= 80 ? '#81B29A' : '#F2CC8F'}
            />
            <OrbitBar
              name="Friends"
              actual={stats.closeCircleHealth}
              goal={100}
              status={stats.closeCircleHealth >= 80 ? 'On Track' : '2 Overdue'}
              statusColor={stats.closeCircleHealth >= 80 ? '#81B29A' : '#F2CC8F'}
              barColor={stats.closeCircleHealth >= 80 ? '#81B29A' : '#F2CC8F'}
            />
            <OrbitBar
              name="Acquaintances"
              actual={stats.catchupCircleHealth}
              goal={100}
              status={stats.catchupCircleHealth >= 80 ? 'On Track' : 'Catching Up'}
              statusColor={stats.catchupCircleHealth >= 80 ? '#81B29A' : '#81B29A'}
              barColor="#81B29A"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginBottom: 12, paddingHorizontal: 4 }}>
            How You Connect
          </Text>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 20,
              padding: 20,
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
              elevation: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {!premiumStatus.isPremium && (
              <TouchableOpacity
                onPress={onPremiumRequired}
                activeOpacity={0.95}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.97)',
                  zIndex: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 20,
                }}
              >
                <View style={{ alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(224, 122, 95, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="chart-donut" size={24} color="#E07A5F" />
                  </View>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: '#3D405B' }}>
                    Connection Breakdown
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: 'rgba(61, 64, 91, 0.6)', textAlign: 'center' }}>
                    Upgrade to see how you connect
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(224, 122, 95, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="chat" size={24} color="#E07A5F" />
                </View>
                <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: '#E07A5F' }}>{connectionTypes.texting}%</Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>Texting</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(129, 178, 154, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="phone" size={24} color="#81B29A" />
                </View>
                <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: '#81B29A' }}>{connectionTypes.calls}%</Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>Calls</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(61, 64, 91, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#3D405B" />
                </View>
                <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: '#3D405B' }}>{connectionTypes.inPerson}%</Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>In Person</Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#F4F1DE',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(224, 122, 95, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2,
                }}
              >
                <MaterialCommunityIcons name="lightbulb" size={18} color="#E07A5F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#3D405B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Coach Tip
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(61, 64, 91, 0.8)', lineHeight: 20 }}>
                  Try replacing a few texts with a phone call to boost your 'Depth' score.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
