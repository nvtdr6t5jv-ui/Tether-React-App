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
import Svg, { Circle, G } from 'react-native-svg';

interface SocialPulseScreenProps {
  onBack: () => void;
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

export const SocialPulseScreen: React.FC<SocialPulseScreenProps> = ({ onBack }) => {
  const { getSocialHealthStats, friends, interactions } = useApp();

  const stats = useMemo(() => getSocialHealthStats(), [getSocialHealthStats, friends, interactions]);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1DE' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#3D405B" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#3D405B' }}>
          Your Social Pulse
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="export-variant" size={20} color="#3D405B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 24,
            shadowColor: '#3D405B',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.08,
            shadowRadius: 40,
            elevation: 4,
          }}
        >
          <View style={{ position: 'relative', width: 128, height: 128 }}>
            <ProgressRing
              percentage={stats.overallScore}
              size={128}
              strokeWidth={12}
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
              <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: '#3D405B' }}>
                {stats.overallScore}%
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#81B29A', textTransform: 'uppercase' }}>
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

        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginBottom: 16 }}>
            Are you balancing your circles?
          </Text>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              padding: 24,
              gap: 20,
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 40,
              elevation: 4,
            }}
          >
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

        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginBottom: 16 }}>
            How you connect
          </Text>
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              padding: 24,
              shadowColor: '#3D405B',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 40,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 24 }}>
              <View
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 64,
                    backgroundColor: '#3D405B',
                  }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: 64,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#E07A5F',
                      transform: [{ rotate: '0deg' }],
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#81B29A',
                      borderTopLeftRadius: 64,
                      borderBottomLeftRadius: 64,
                      width: '50%',
                      height: '100%',
                      left: '50%',
                      transform: [{ rotate: '-108deg' }, { translateX: -32 }],
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: '#3D405B',
                      borderTopLeftRadius: 64,
                      borderBottomLeftRadius: 64,
                      width: '50%',
                      left: '50%',
                      transform: [{ rotate: '-144deg' }, { translateX: -32 }],
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 32,
                      left: 32,
                      right: 32,
                      bottom: 32,
                      backgroundColor: '#FFF',
                      borderRadius: 32,
                    }}
                  />
                </View>
              </View>

              <View style={{ flex: 1, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#E07A5F' }} />
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: '#3D405B' }}>
                    Texting <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: '#E07A5F' }}>{connectionTypes.texting}%</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#81B29A' }} />
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: '#3D405B' }}>
                    Calls <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: '#81B29A' }}>{connectionTypes.calls}%</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#3D405B' }} />
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: '#3D405B' }}>
                    In Person <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', color: '#3D405B' }}>{connectionTypes.inPerson}%</Text>
                  </Text>
                </View>
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
