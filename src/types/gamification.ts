export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AchievementCategory = 'streak' | 'connections' | 'social' | 'milestones' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  requirement: number;
  xpReward: number;
  unlockedAt?: Date;
  progress: number;
}

export interface UserLevel {
  level: number;
  title: string;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'calls' | 'texts' | 'in_person' | 'reconnect' | 'any';
  target: number;
  progress: number;
  xpReward: number;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
}

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  startDate: Date;
  endDate: Date;
  challenges: WeeklyChallenge[];
  specialAchievementId?: string;
  isActive: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  streak: number;
  isCurrentUser: boolean;
}

export interface Leaderboard {
  id: string;
  type: 'weekly_connections' | 'streak' | 'monthly_score';
  title: string;
  entries: LeaderboardEntry[];
  userRank: number;
  lastUpdated: Date;
}

export interface RelationshipMilestone {
  id: string;
  friendId: string;
  friendName: string;
  type: 'first_contact' | 'one_year' | 'interactions_100' | 'interactions_500' | 'streak_30' | 'streak_100';
  title: string;
  description: string;
  achievedAt: Date;
  xpReward: number;
  celebrated: boolean;
}

export interface GardenPlant {
  id: string;
  name: string;
  stage: 'seed' | 'sprout' | 'growing' | 'blooming' | 'flourishing';
  health: number;
  lastWatered: Date;
  streakRequired: number;
  icon: string;
}

export interface UserGarden {
  plants: GardenPlant[];
  totalPlantsGrown: number;
  currentStreak: number;
  gardenHealth: number;
}

export interface GamificationState {
  level: UserLevel;
  achievements: Achievement[];
  weeklyChallenges: WeeklyChallenge[];
  seasonalEvents: SeasonalEvent[];
  leaderboards: Leaderboard[];
  relationshipMilestones: RelationshipMilestone[];
  garden: UserGarden;
  leaderboardOptIn: boolean;
}

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

export const TIER_BG_COLORS: Record<AchievementTier, string> = {
  bronze: 'rgba(205, 127, 50, 0.15)',
  silver: 'rgba(192, 192, 192, 0.15)',
  gold: 'rgba(255, 215, 0, 0.15)',
  platinum: 'rgba(229, 228, 226, 0.2)',
};

export const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: 'Social Seedling' },
  { minLevel: 5, title: 'Connection Starter' },
  { minLevel: 10, title: 'Friend Keeper' },
  { minLevel: 15, title: 'Relationship Builder' },
  { minLevel: 20, title: 'Social Enthusiast' },
  { minLevel: 25, title: 'Bond Strengthener' },
  { minLevel: 30, title: 'Circle Expander' },
  { minLevel: 40, title: 'Connection Master' },
  { minLevel: 50, title: 'Social Champion' },
  { minLevel: 75, title: 'Relationship Guru' },
  { minLevel: 100, title: 'Legendary Connector' },
];

export const XP_PER_ACTION: Record<string, number> = {
  text: 5,
  call: 15,
  video_call: 20,
  in_person: 30,
  social_media: 3,
  email: 5,
  other: 5,
  daily_login: 2,
  streak_day: 5,
  challenge_complete: 50,
  achievement_unlock: 100,
};

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Log your first connection',
    icon: 'shoe-print',
    category: 'connections',
    tier: 'bronze',
    requirement: 1,
    xpReward: 50,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Connect with 10 different people in a week',
    icon: 'butterfly',
    category: 'social',
    tier: 'silver',
    requirement: 10,
    xpReward: 150,
  },
  {
    id: 'super_connector',
    name: 'Super Connector',
    description: 'Connect with 25 different people in a week',
    icon: 'lightning-bolt',
    category: 'social',
    tier: 'gold',
    requirement: 25,
    xpReward: 300,
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: 'fire',
    category: 'streak',
    tier: 'bronze',
    requirement: 3,
    xpReward: 30,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'fire',
    category: 'streak',
    tier: 'bronze',
    requirement: 7,
    xpReward: 75,
  },
  {
    id: 'consistency_champion',
    name: 'Consistency Champion',
    description: 'Maintain a 30-day streak',
    icon: 'fire',
    category: 'streak',
    tier: 'silver',
    requirement: 30,
    xpReward: 200,
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Maintain a 100-day streak',
    icon: 'fire',
    category: 'streak',
    tier: 'gold',
    requirement: 100,
    xpReward: 500,
  },
  {
    id: 'eternal_flame',
    name: 'Eternal Flame',
    description: 'Maintain a 365-day streak',
    icon: 'fire',
    category: 'streak',
    tier: 'platinum',
    requirement: 365,
    xpReward: 1000,
  },
  {
    id: 'deep_diver',
    name: 'Deep Diver',
    description: 'Have 5 deep talks in a month',
    icon: 'diving-scuba-mask',
    category: 'social',
    tier: 'silver',
    requirement: 5,
    xpReward: 150,
  },
  {
    id: 'phone_friend',
    name: 'Phone Friend',
    description: 'Make 10 phone calls',
    icon: 'phone',
    category: 'connections',
    tier: 'bronze',
    requirement: 10,
    xpReward: 75,
  },
  {
    id: 'call_master',
    name: 'Call Master',
    description: 'Make 50 phone calls',
    icon: 'phone',
    category: 'connections',
    tier: 'silver',
    requirement: 50,
    xpReward: 200,
  },
  {
    id: 'voice_virtuoso',
    name: 'Voice Virtuoso',
    description: 'Make 200 phone calls',
    icon: 'phone',
    category: 'connections',
    tier: 'gold',
    requirement: 200,
    xpReward: 400,
  },
  {
    id: 'texter',
    name: 'Texter',
    description: 'Send 25 text check-ins',
    icon: 'message-text',
    category: 'connections',
    tier: 'bronze',
    requirement: 25,
    xpReward: 50,
  },
  {
    id: 'messenger',
    name: 'Messenger',
    description: 'Send 100 text check-ins',
    icon: 'message-text',
    category: 'connections',
    tier: 'silver',
    requirement: 100,
    xpReward: 150,
  },
  {
    id: 'text_titan',
    name: 'Text Titan',
    description: 'Send 500 text check-ins',
    icon: 'message-text',
    category: 'connections',
    tier: 'gold',
    requirement: 500,
    xpReward: 350,
  },
  {
    id: 'face_to_face',
    name: 'Face to Face',
    description: 'Have 5 in-person meetups',
    icon: 'account-group',
    category: 'connections',
    tier: 'bronze',
    requirement: 5,
    xpReward: 100,
  },
  {
    id: 'social_star',
    name: 'Social Star',
    description: 'Have 25 in-person meetups',
    icon: 'account-group',
    category: 'connections',
    tier: 'silver',
    requirement: 25,
    xpReward: 250,
  },
  {
    id: 'gathering_guru',
    name: 'Gathering Guru',
    description: 'Have 100 in-person meetups',
    icon: 'account-group',
    category: 'connections',
    tier: 'gold',
    requirement: 100,
    xpReward: 500,
  },
  {
    id: 'birthday_hero',
    name: 'Birthday Hero',
    description: 'Wish 5 friends happy birthday',
    icon: 'cake-variant',
    category: 'milestones',
    tier: 'bronze',
    requirement: 5,
    xpReward: 75,
  },
  {
    id: 'birthday_champion',
    name: 'Birthday Champion',
    description: 'Never miss a birthday for 6 months',
    icon: 'cake-variant',
    category: 'milestones',
    tier: 'gold',
    requirement: 180,
    xpReward: 300,
  },
  {
    id: 'orbit_master',
    name: 'Orbit Master',
    description: 'Keep all orbits on track for 2 weeks',
    icon: 'orbit',
    category: 'milestones',
    tier: 'silver',
    requirement: 14,
    xpReward: 200,
  },
  {
    id: 'inner_circle_keeper',
    name: 'Inner Circle Keeper',
    description: 'Stay connected with all favorites for 30 days',
    icon: 'heart-circle',
    category: 'milestones',
    tier: 'gold',
    requirement: 30,
    xpReward: 350,
  },
  {
    id: 'reconnector',
    name: 'Reconnector',
    description: 'Reach out to someone after 60+ days',
    icon: 'account-reactivate',
    category: 'social',
    tier: 'bronze',
    requirement: 1,
    xpReward: 50,
  },
  {
    id: 'bridge_builder',
    name: 'Bridge Builder',
    description: 'Reconnect with 10 dormant contacts',
    icon: 'bridge',
    category: 'social',
    tier: 'silver',
    requirement: 10,
    xpReward: 175,
  },
  {
    id: 'no_one_forgotten',
    name: 'No One Forgotten',
    description: 'Reconnect with 25 dormant contacts',
    icon: 'account-heart',
    category: 'social',
    tier: 'gold',
    requirement: 25,
    xpReward: 400,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log a connection before 9 AM',
    icon: 'weather-sunset-up',
    category: 'special',
    tier: 'bronze',
    requirement: 1,
    xpReward: 25,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Log a connection after 10 PM',
    icon: 'owl',
    category: 'special',
    tier: 'bronze',
    requirement: 1,
    xpReward: 25,
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Connect with 5 people on a weekend',
    icon: 'calendar-weekend',
    category: 'special',
    tier: 'bronze',
    requirement: 5,
    xpReward: 75,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Log 100 total connections',
    icon: 'numeric-100-box',
    category: 'connections',
    tier: 'silver',
    requirement: 100,
    xpReward: 200,
  },
  {
    id: 'five_hundred_club',
    name: 'Five Hundred Club',
    description: 'Log 500 total connections',
    icon: 'star-circle',
    category: 'connections',
    tier: 'gold',
    requirement: 500,
    xpReward: 500,
  },
  {
    id: 'thousand_touches',
    name: 'Thousand Touches',
    description: 'Log 1000 total connections',
    icon: 'trophy',
    category: 'connections',
    tier: 'platinum',
    requirement: 1000,
    xpReward: 1000,
  },
  {
    id: 'variety_seeker',
    name: 'Variety Seeker',
    description: 'Use all connection types in one week',
    icon: 'palette',
    category: 'special',
    tier: 'silver',
    requirement: 7,
    xpReward: 150,
  },
  {
    id: 'holiday_spirit',
    name: 'Holiday Spirit',
    description: 'Complete a seasonal event challenge',
    icon: 'gift',
    category: 'special',
    tier: 'silver',
    requirement: 1,
    xpReward: 150,
  },
  {
    id: 'challenge_crusher',
    name: 'Challenge Crusher',
    description: 'Complete 10 weekly challenges',
    icon: 'trophy-variant',
    category: 'milestones',
    tier: 'silver',
    requirement: 10,
    xpReward: 250,
  },
  {
    id: 'challenge_master',
    name: 'Challenge Master',
    description: 'Complete 50 weekly challenges',
    icon: 'medal',
    category: 'milestones',
    tier: 'gold',
    requirement: 50,
    xpReward: 500,
  },
];

export const MOCK_WEEKLY_CHALLENGES: Omit<WeeklyChallenge, 'startDate' | 'endDate'>[] = [
  {
    id: 'wc_calls_3',
    title: 'Call 3 People',
    description: 'Make phone calls to 3 different people this week',
    icon: 'phone',
    type: 'calls',
    target: 3,
    progress: 0,
    xpReward: 75,
    isCompleted: false,
  },
  {
    id: 'wc_reconnect',
    title: 'Reconnect',
    description: "Reach out to someone you haven't talked to in 60+ days",
    icon: 'account-reactivate',
    type: 'reconnect',
    target: 1,
    progress: 0,
    xpReward: 50,
    isCompleted: false,
  },
  {
    id: 'wc_in_person',
    title: 'Meet Up',
    description: 'Have an in-person meetup with a friend',
    icon: 'account-group',
    type: 'in_person',
    target: 1,
    progress: 0,
    xpReward: 60,
    isCompleted: false,
  },
];

export const MOCK_SEASONAL_EVENT: SeasonalEvent = {
  id: 'summer_connections_2024',
  name: 'Summer Connections',
  description: 'Warm up your relationships this summer! Complete special challenges to earn bonus XP.',
  icon: 'white-balance-sunny',
  theme: '#F59E0B',
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-08-31'),
  challenges: [
    {
      id: 'sc_outdoor',
      title: 'Outdoor Hangout',
      description: 'Have 3 outdoor meetups with friends',
      icon: 'tree',
      type: 'in_person',
      target: 3,
      progress: 0,
      xpReward: 100,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      isCompleted: false,
    },
    {
      id: 'sc_catchup',
      title: 'Summer Catch-Up',
      description: 'Reconnect with 5 friends from different orbits',
      icon: 'account-multiple-check',
      type: 'any',
      target: 5,
      progress: 2,
      xpReward: 150,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      isCompleted: false,
    },
  ],
  specialAchievementId: 'holiday_spirit',
  isActive: true,
};

export const MOCK_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { userId: '1', username: 'SocialStar23', score: 2450, rank: 1, streak: 45, isCurrentUser: false },
  { userId: '2', username: 'ConnectorKing', score: 2280, rank: 2, streak: 38, isCurrentUser: false },
  { userId: '3', username: 'FriendlyFiona', score: 2150, rank: 3, streak: 52, isCurrentUser: false },
  { userId: '4', username: 'You', score: 1890, rank: 4, streak: 12, isCurrentUser: true },
  { userId: '5', username: 'BondBuilder', score: 1750, rank: 5, streak: 28, isCurrentUser: false },
  { userId: '6', username: 'ChatChamp', score: 1680, rank: 6, streak: 21, isCurrentUser: false },
  { userId: '7', username: 'ReachOutRoy', score: 1520, rank: 7, streak: 15, isCurrentUser: false },
  { userId: '8', username: 'KeepInTouch', score: 1450, rank: 8, streak: 19, isCurrentUser: false },
  { userId: '9', username: 'SocialSally', score: 1380, rank: 9, streak: 11, isCurrentUser: false },
  { userId: '10', username: 'ConnectionPro', score: 1290, rank: 10, streak: 8, isCurrentUser: false },
];

export const PLANT_STAGES: { stage: GardenPlant['stage']; icon: string; streakRequired: number }[] = [
  { stage: 'seed', icon: 'seed', streakRequired: 0 },
  { stage: 'sprout', icon: 'sprout', streakRequired: 3 },
  { stage: 'growing', icon: 'leaf', streakRequired: 7 },
  { stage: 'blooming', icon: 'flower', streakRequired: 14 },
  { stage: 'flourishing', icon: 'tree', streakRequired: 30 },
];

export const calculateLevel = (totalXP: number): UserLevel => {
  const xpPerLevel = 100;
  const level = Math.floor(totalXP / xpPerLevel) + 1;
  const currentLevelXP = totalXP % xpPerLevel;
  const title = LEVEL_TITLES.filter(l => l.minLevel <= level).pop()?.title || 'Social Seedling';
  
  return {
    level,
    title,
    currentXP: currentLevelXP,
    xpToNextLevel: xpPerLevel,
    totalXP,
  };
};

export const getPlantStage = (streak: number): GardenPlant['stage'] => {
  const stage = PLANT_STAGES.filter(s => s.streakRequired <= streak).pop();
  return stage?.stage || 'seed';
};
