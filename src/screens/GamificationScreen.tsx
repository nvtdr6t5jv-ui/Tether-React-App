import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useGamification } from '../context/GamificationContext';
import {
  Achievement,
  AchievementTier,
  TIER_COLORS,
  TIER_BG_COLORS,
  WeeklyChallenge,
  LeaderboardEntry,
} from '../types/gamification';

const { width } = Dimensions.get('window');

type TabType = 'overview' | 'achievements' | 'challenges' | 'leaderboard' | 'garden';

interface GamificationScreenProps {
  onBack: () => void;
}

const LevelCard: React.FC<{ level: number; title: string; currentXP: number; xpToNextLevel: number; totalXP: number }> = ({
  level,
  title,
  currentXP,
  xpToNextLevel,
  totalXP,
}) => {
  const progress = (currentXP / xpToNextLevel) * 100;
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#3D405B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Animated.View style={pulseStyle}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#81B29A',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 4,
              borderColor: 'rgba(129, 178, 154, 0.3)',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#FFF' }}>
              {level}
            </Text>
          </View>
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, color: '#3D405B' }}>
            {title}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: 'rgba(61, 64, 91, 0.6)', marginTop: 2 }}>
            {totalXP.toLocaleString()} Total XP
          </Text>
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: 'rgba(61, 64, 91, 0.5)' }}>
                Level {level}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: 'rgba(61, 64, 91, 0.5)' }}>
                Level {level + 1}
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: 'rgba(129, 178, 154, 0.2)', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#81B29A', borderRadius: 4 }} />
            </View>
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(61, 64, 91, 0.5)', marginTop: 4, textAlign: 'center' }}>
              {currentXP} / {xpToNextLevel} XP
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const AchievementCard: React.FC<{ achievement: Achievement; index: number; onPress: () => void }> = ({
  achievement,
  index,
  onPress,
}) => {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = (achievement.progress / achievement.requirement) * 100;

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          backgroundColor: isUnlocked ? TIER_BG_COLORS[achievement.tier] : '#FFF',
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderWidth: isUnlocked ? 2 : 1,
          borderColor: isUnlocked ? TIER_COLORS[achievement.tier] : 'rgba(61, 64, 91, 0.1)',
          marginBottom: 12,
          opacity: isUnlocked ? 1 : 0.7,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isUnlocked ? TIER_COLORS[achievement.tier] : 'rgba(61, 64, 91, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name={achievement.icon as any}
            size={24}
            color={isUnlocked ? '#FFF' : 'rgba(61, 64, 91, 0.4)'}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
              {achievement.name}
            </Text>
            {isUnlocked && (
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: TIER_COLORS[achievement.tier],
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, color: '#FFF', textTransform: 'uppercase' }}>
                  {achievement.tier}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)', marginTop: 2 }}>
            {achievement.description}
          </Text>
          {!isUnlocked && (
            <View style={{ marginTop: 8 }}>
              <View style={{ height: 4, backgroundColor: 'rgba(61, 64, 91, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#81B29A', borderRadius: 2 }} />
              </View>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 10, color: 'rgba(61, 64, 91, 0.5)', marginTop: 2 }}>
                {achievement.progress} / {achievement.requirement}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#81B29A' }}>
          +{achievement.xpReward} XP
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ChallengeCard: React.FC<{ challenge: WeeklyChallenge; index: number }> = ({ challenge, index }) => {
  const progress = (challenge.progress / challenge.target) * 100;

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <View
        style={{
          backgroundColor: challenge.isCompleted ? 'rgba(129, 178, 154, 0.1)' : '#FFF',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: challenge.isCompleted ? 2 : 1,
          borderColor: challenge.isCompleted ? '#81B29A' : 'rgba(61, 64, 91, 0.1)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: challenge.isCompleted ? '#81B29A' : 'rgba(61, 64, 91, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {challenge.isCompleted ? (
              <MaterialCommunityIcons name="check" size={24} color="#FFF" />
            ) : (
              <MaterialCommunityIcons name={challenge.icon as any} size={22} color="#3D405B" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#3D405B' }}>
              {challenge.title}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)', marginTop: 2 }}>
              {challenge.description}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#81B29A' }}>
              +{challenge.xpReward} XP
            </Text>
          </View>
        </View>
        {!challenge.isCompleted && (
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(61, 64, 91, 0.5)' }}>
                Progress
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, color: '#3D405B' }}>
                {challenge.progress} / {challenge.target}
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: 'rgba(61, 64, 91, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#E07A5F', borderRadius: 3 }} />
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const LeaderboardRow: React.FC<{ entry: LeaderboardEntry; index: number }> = ({ entry, index }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return { icon: 'trophy', color: '#FFD700' };
    if (rank === 2) return { icon: 'medal', color: '#C0C0C0' };
    if (rank === 3) return { icon: 'medal', color: '#CD7F32' };
    return null;
  };

  const rankIcon = getRankIcon(entry.rank);

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <View
        style={{
          backgroundColor: entry.isCurrentUser ? 'rgba(129, 178, 154, 0.15)' : '#FFF',
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8,
          borderWidth: entry.isCurrentUser ? 2 : 1,
          borderColor: entry.isCurrentUser ? '#81B29A' : 'rgba(61, 64, 91, 0.08)',
        }}
      >
        <View style={{ width: 32, alignItems: 'center' }}>
          {rankIcon ? (
            <MaterialCommunityIcons name={rankIcon.icon as any} size={24} color={rankIcon.color} />
          ) : (
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: 'rgba(61, 64, 91, 0.5)' }}>
              {entry.rank}
            </Text>
          )}
        </View>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: entry.isCurrentUser ? '#81B29A' : '#E07A5F',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#FFF' }}>
            {entry.username.charAt(0)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#3D405B' }}>
            {entry.username}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MaterialCommunityIcons name="fire" size={12} color="#F59E0B" />
            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(61, 64, 91, 0.6)' }}>
              {entry.streak} day streak
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: '#81B29A' }}>
          {entry.score.toLocaleString()}
        </Text>
      </View>
    </Animated.View>
  );
};

const GARDEN_STAGE_DATA = [
  { stage: 'seed', icon: 'seed', name: 'Seed', size: 60, color: '#8B6914', minLevel: 1 },
  { stage: 'sprout', icon: 'sprout', name: 'Sprout', size: 70, color: '#81B29A', minLevel: 2 },
  { stage: 'growing', icon: 'leaf', name: 'Growing', size: 80, color: '#5A8F7B', minLevel: 5 },
  { stage: 'blooming', icon: 'flower', name: 'Blooming', size: 90, color: '#E07A5F', minLevel: 10 },
  { stage: 'flourishing', icon: 'tree', name: 'Flourishing', size: 100, color: '#2D5A47', minLevel: 20 },
];

const GardenView: React.FC<{ streak: number; gardenHealth: number; level: number; onWater: () => void; onGoToChallenge: () => void }> = ({
  streak,
  gardenHealth,
  level,
  onWater,
  onGoToChallenge,
}) => {
  const getStageByLevel = (lvl: number) => {
    return GARDEN_STAGE_DATA.filter(s => s.minLevel <= lvl).pop() || GARDEN_STAGE_DATA[0];
  };
  
  const currentStage = getStageByLevel(level);
  const nextStage = GARDEN_STAGE_DATA.find(s => s.minLevel > level);

  const swayAnim = useSharedValue(0);

  React.useEffect(() => {
    swayAnim.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000 }),
        withTiming(5, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const plantStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swayAnim.value}deg` }],
  }));

  return (
    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
      <Animated.View style={plantStyle}>
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: 'rgba(129, 178, 154, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: 'rgba(129, 178, 154, 0.3)',
          }}
        >
          <MaterialCommunityIcons name={currentStage.icon as any} size={currentStage.size} color={currentStage.color} />
        </View>
      </Animated.View>
      <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: '#3D405B', marginTop: 20 }}>
        {currentStage.name}
      </Text>
      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, color: 'rgba(61, 64, 91, 0.6)', marginTop: 4 }}>
        Level {level} - Keep growing by earning XP!
      </Text>

      {nextStage && (
        <View style={{ backgroundColor: '#F4F1DE', borderRadius: 12, padding: 16, marginTop: 20, width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MaterialCommunityIcons name={nextStage.icon as any} size={32} color="rgba(61, 64, 91, 0.4)" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, color: '#3D405B' }}>
                Next: {nextStage.name}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                Reach level {nextStage.minLevel}
              </Text>
            </View>
            <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, color: '#81B29A' }}>
              {nextStage.minLevel - level} level{nextStage.minLevel - level !== 1 ? 's' : ''} away
            </Text>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center' }}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#E07A5F" />
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#3D405B', marginTop: 8 }}>
            {gardenHealth}%
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(61, 64, 91, 0.6)' }}>
            Garden Health
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center' }}>
          <MaterialCommunityIcons name="fire" size={24} color="#F59E0B" />
          <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#3D405B', marginTop: 8 }}>
            {streak}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(61, 64, 91, 0.6)' }}>
            Day Streak
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onGoToChallenge}
        activeOpacity={0.8}
        style={{
          marginTop: 20,
          width: '100%',
          backgroundColor: '#81B29A',
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <MaterialCommunityIcons name="target" size={20} color="#FFF" />
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#FFF' }}>
          Complete Challenges to Level Up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onWater}
        activeOpacity={0.8}
        style={{
          marginTop: 12,
          width: '100%',
          backgroundColor: '#FFF',
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor: 'rgba(129, 178, 154, 0.3)',
        }}
      >
        <MaterialCommunityIcons name="watering-can" size={20} color="#81B29A" />
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#81B29A' }}>
          Log a Connection
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const GamificationScreen: React.FC<GamificationScreenProps> = ({ onBack }) => {
  const {
    state,
    toggleLeaderboardOptIn,
    waterGarden,
    getUnlockedAchievements,
    getLockedAchievements,
    getActiveSeasonalEvent,
  } = useGamification();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();
  const seasonalEvent = getActiveSeasonalEvent();

  const filteredAchievements = useMemo(() => {
    const all = [...unlockedAchievements, ...lockedAchievements];
    if (selectedCategory === 'all') return all;
    if (selectedCategory === 'unlocked') return unlockedAchievements;
    return all.filter(a => a.category === selectedCategory);
  }, [unlockedAchievements, lockedAchievements, selectedCategory]);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
    { id: 'achievements', label: 'Badges', icon: 'trophy' },
    { id: 'challenges', label: 'Challenges', icon: 'target' },
    { id: 'leaderboard', label: 'Ranks', icon: 'podium' },
    { id: 'garden', label: 'Garden', icon: 'flower' },
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'unlocked', label: 'Unlocked' },
    { id: 'streak', label: 'Streaks' },
    { id: 'connections', label: 'Connections' },
    { id: 'social', label: 'Social' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'special', label: 'Special' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8F6' }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#3D405B" />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: '#3D405B', textAlign: 'center' }}>
          Progress
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
        style={{ flexGrow: 0 }}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: activeTab === tab.id ? '#3D405B' : '#FFF',
              borderRadius: 20,
            }}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? '#FFF' : '#3D405B'}
            />
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 13,
                color: activeTab === tab.id ? '#FFF' : '#3D405B',
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <>
            <Animated.View entering={FadeInDown.duration(400)}>
              <LevelCard
                level={state.level.level}
                title={state.level.title}
                currentXP={state.level.currentXP}
                xpToNextLevel={state.level.xpToNextLevel}
                totalXP={state.level.totalXP}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
                  Recent Achievements
                </Text>
                <TouchableOpacity onPress={() => setActiveTab('achievements')}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#81B29A' }}>
                    View All
                  </Text>
                </TouchableOpacity>
              </View>
              {unlockedAchievements.slice(0, 3).map((achievement, index) => (
                <AchievementCard key={achievement.id} achievement={achievement} index={index} onPress={() => {}} />
              ))}
              {unlockedAchievements.length === 0 && (
                <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center' }}>
                  <MaterialCommunityIcons name="trophy-outline" size={48} color="rgba(61, 64, 91, 0.2)" />
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: 'rgba(61, 64, 91, 0.5)', marginTop: 12 }}>
                    No achievements yet
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.4)', marginTop: 4 }}>
                    Keep connecting to unlock badges!
                  </Text>
                </View>
              )}
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
                  Weekly Challenges
                </Text>
                <TouchableOpacity onPress={() => setActiveTab('challenges')}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 14, color: '#81B29A' }}>
                    View All
                  </Text>
                </TouchableOpacity>
              </View>
              {state.weeklyChallenges.slice(0, 2).map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))}
            </Animated.View>

            {seasonalEvent && (
              <Animated.View entering={FadeInUp.delay(400).duration(400)} style={{ marginTop: 20 }}>
                <View
                  style={{
                    backgroundColor: seasonalEvent.theme,
                    borderRadius: 20,
                    padding: 20,
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialCommunityIcons name={seasonalEvent.icon as any} size={28} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: '#FFF' }}>
                        {seasonalEvent.name}
                      </Text>
                      <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>
                        {seasonalEvent.description}
                      </Text>
                    </View>
                  </View>
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 8 }}>
                      {seasonalEvent.challenges.filter(c => c.isCompleted).length} / {seasonalEvent.challenges.length} Challenges Complete
                    </Text>
                    <View style={{ height: 6, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 3, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          width: `${(seasonalEvent.challenges.filter(c => c.isCompleted).length / seasonalEvent.challenges.length) * 100}%`,
                          backgroundColor: '#FFF',
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInUp.delay(500).duration(400)} style={{ marginTop: 20 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginBottom: 12 }}>
                Stats
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#81B29A' }}>
                    {unlockedAchievements.length}
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                    Badges
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#E07A5F' }}>
                    {state.weeklyChallenges.filter(c => c.isCompleted).length}
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                    Challenges
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 28, color: '#3D405B' }}>
                    {state.relationshipMilestones.length}
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)' }}>
                    Milestones
                  </Text>
                </View>
              </View>
            </Animated.View>
          </>
        )}

        {activeTab === 'achievements' && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 16 }}
            >
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: selectedCategory === cat.id ? '#81B29A' : '#FFF',
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                      fontSize: 13,
                      color: selectedCategory === cat.id ? '#FFF' : '#3D405B',
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 13, color: 'rgba(61, 64, 91, 0.5)', marginBottom: 12 }}>
              {unlockedAchievements.length} / {state.achievements.length} Unlocked
            </Text>

            {filteredAchievements.map((achievement, index) => (
              <AchievementCard key={achievement.id} achievement={achievement} index={index} onPress={() => {}} />
            ))}
          </>
        )}

        {activeTab === 'challenges' && (
          <>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginBottom: 4 }}>
                This Week's Challenges
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: 'rgba(61, 64, 91, 0.6)' }}>
                Complete challenges to earn bonus XP
              </Text>
            </View>
            {state.weeklyChallenges.map((challenge, index) => (
              <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
            ))}

            {seasonalEvent && (
              <View style={{ marginTop: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <MaterialCommunityIcons name={seasonalEvent.icon as any} size={20} color={seasonalEvent.theme} />
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B' }}>
                    {seasonalEvent.name} Challenges
                  </Text>
                </View>
                {seasonalEvent.challenges.map((challenge, index) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'leaderboard' && (
          <>
            <View
              style={{
                backgroundColor: '#FFF',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: '#3D405B' }}>
                  Join Leaderboards
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, color: 'rgba(61, 64, 91, 0.6)', marginTop: 2 }}>
                  Compare with friends anonymously
                </Text>
              </View>
              <Switch
                value={state.leaderboardOptIn}
                onValueChange={toggleLeaderboardOptIn}
                trackColor={{ false: 'rgba(61, 64, 91, 0.2)', true: 'rgba(129, 178, 154, 0.5)' }}
                thumbColor={state.leaderboardOptIn ? '#81B29A' : '#FFF'}
              />
            </View>

            {state.leaderboardOptIn ? (
              state.leaderboards.map(leaderboard => (
                <View key={leaderboard.id} style={{ marginBottom: 24 }}>
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 18, color: '#3D405B', marginBottom: 12 }}>
                    {leaderboard.title}
                  </Text>
                  {leaderboard.entries.map((entry, index) => (
                    <LeaderboardRow key={entry.userId} entry={entry} index={index} />
                  ))}
                </View>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <MaterialCommunityIcons name="podium" size={64} color="rgba(61, 64, 91, 0.15)" />
                <Text style={{ fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: 'rgba(61, 64, 91, 0.4)', marginTop: 16 }}>
                  Leaderboards are disabled
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: 'rgba(61, 64, 91, 0.3)', marginTop: 4, textAlign: 'center' }}>
                  Enable to see how you rank against others
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'garden' && (
          <GardenView
            streak={state.garden.currentStreak}
            gardenHealth={state.garden.gardenHealth}
            level={state.level.level}
            onWater={waterGarden}
            onGoToChallenge={() => setActiveTab('challenges')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
