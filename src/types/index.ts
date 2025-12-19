export type OrbitId = 'inner' | 'close' | 'catchup';

export interface Friend {
  id: string;
  name: string;
  initials: string;
  photo?: string;
  phone?: string;
  email?: string;
  birthday?: string;
  orbitId: OrbitId;
  lastContact: Date | null;
  nextNudge: Date;
  isFavorite: boolean;
  tags: string[];
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteType = 'draft' | 'memory' | 'gift_idea' | 'life_update';

export interface Note {
  id: string;
  friendId: string;
  type: NoteType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isSent?: boolean;
}

export type InteractionType = 'call' | 'text' | 'video_call' | 'in_person' | 'social_media' | 'email' | 'other';

export interface Interaction {
  id: string;
  friendId: string;
  type: InteractionType;
  note?: string;
  duration?: number;
  location?: string;
  date: Date;
  createdAt: Date;
}

export type NudgeStatus = 'pending' | 'completed' | 'snoozed' | 'dismissed';

export interface Nudge {
  id: string;
  friendId: string;
  type: InteractionType;
  message: string;
  dueDate: Date;
  status: NudgeStatus;
  completedAt?: Date;
  snoozedUntil?: Date;
  createdAt: Date;
}

export interface Draft {
  id: string;
  friendId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Birthday {
  friendId: string;
  friendName: string;
  date: string;
  daysUntil: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  photo?: string;
  memberSince: Date;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type NotificationFrequency = 'realtime' | 'daily' | 'weekly' | 'off';

export interface UserSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  notificationTime: string;
  vacationMode: boolean;
  contactsSynced: boolean;
  hapticFeedback: boolean;
}

export interface PremiumStatus {
  isPremium: boolean;
  plan?: 'monthly' | 'yearly';
  expiresAt?: Date;
  trialUsed: boolean;
}

export const FREE_CONTACT_LIMIT = 5;
export const FREE_HISTORY_DAYS = 30;

export const MESSAGE_TEMPLATES = [
  { id: '1', category: 'catch-up', text: "Hey! Been thinking about you. How have you been?" },
  { id: '2', category: 'catch-up', text: "It's been a while! Would love to catch up soon." },
  { id: '3', category: 'catch-up', text: "Miss our chats! Free for a call this week?" },
  { id: '4', category: 'birthday', text: "Happy birthday! Hope you have an amazing day!" },
  { id: '5', category: 'birthday', text: "Wishing you the happiest of birthdays! Let's celebrate soon." },
  { id: '6', category: 'congrats', text: "Congratulations! So happy for you!" },
  { id: '7', category: 'congrats', text: "Just heard the news - that's amazing! Well deserved." },
  { id: '8', category: 'thinking', text: "Saw something that reminded me of you today!" },
  { id: '9', category: 'thinking', text: "Random thought - remember when we...? Good times!" },
  { id: '10', category: 'support', text: "Hey, just checking in. How are you holding up?" },
];

export interface SocialHealthStats {
  overallScore: number;
  innerCircleHealth: number;
  closeCircleHealth: number;
  catchupCircleHealth: number;
  totalConnections: number;
  connectionsThisWeek: number;
  connectionsThisMonth: number;
  longestStreak: number;
  currentStreak: number;
  overdueCount: number;
  upcomingBirthdays: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  friendId?: string;
  friendIds?: string[];
  type: 'birthday' | 'anniversary' | 'meetup' | 'call' | 'reminder' | 'custom';
  isRecurring: boolean;
  recurringType?: 'yearly' | 'monthly' | 'weekly';
  color?: string;
  notes?: string;
  location?: string;
  isCompleted: boolean;
  createdAt: Date;
  sourceCalendarId?: string;
}

export type QuickTag = 'caught_up' | 'made_plans' | 'checked_in' | 'deep_talk' | 'quick_hello' | 'celebration';

export const QUICK_TAGS: { id: QuickTag; label: string; icon: string; color: string }[] = [
  { id: 'caught_up', label: 'Caught up', icon: 'coffee', color: '#81B29A' },
  { id: 'made_plans', label: 'Made plans', icon: 'calendar-check', color: '#6366F1' },
  { id: 'checked_in', label: 'Checked in', icon: 'hand-wave', color: '#E07A5F' },
  { id: 'deep_talk', label: 'Deep talk', icon: 'heart', color: '#EC4899' },
  { id: 'quick_hello', label: 'Quick hello', icon: 'message-text', color: '#F59E0B' },
  { id: 'celebration', label: 'Celebration', icon: 'party-popper', color: '#8B5CF6' },
];

export interface ConversationStarter {
  id: string;
  text: string;
  category: 'catch_up' | 'deep' | 'fun' | 'support';
}

export const CONVERSATION_STARTERS: ConversationStarter[] = [
  { id: '1', text: "What's been the highlight of your week?", category: 'catch_up' },
  { id: '2', text: "Any exciting plans coming up?", category: 'catch_up' },
  { id: '3', text: "How's work/school been treating you?", category: 'catch_up' },
  { id: '4', text: "What's something you've been thinking about lately?", category: 'deep' },
  { id: '5', text: "What's a goal you're working towards right now?", category: 'deep' },
  { id: '6', text: "If you could change one thing about your routine, what would it be?", category: 'deep' },
  { id: '7', text: "Seen any good movies or shows recently?", category: 'fun' },
  { id: '8', text: "What's the best thing you ate this week?", category: 'fun' },
  { id: '9', text: "If we could go anywhere right now, where would you pick?", category: 'fun' },
  { id: '10', text: "How are you really doing?", category: 'support' },
  { id: '11', text: "Is there anything I can help you with?", category: 'support' },
  { id: '12', text: "I've been thinking about you - wanted to check in.", category: 'support' },
];

export interface Milestone {
  id: string;
  type: 'streak' | 'connections' | 'relationship' | 'first_contact';
  title: string;
  description: string;
  achievedAt: Date;
  friendId?: string;
  value?: number;
}

export interface DailyCheckIn {
  id: string;
  date: Date;
  friendsContacted: string[];
  mood?: 'great' | 'good' | 'okay' | 'low';
  note?: string;
}

export interface RelationshipHealth {
  friendId: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  lastInteractionDays: number;
  averageFrequency: number;
  suggestions: string[];
}

export interface Orbit {
  id: OrbitId;
  name: string;
  description: string;
  frequency: string;
  daysInterval: number;
  color: string;
}

export const ORBITS: Orbit[] = [
  {
    id: 'inner',
    name: 'Favorites',
    description: 'Your closest people',
    frequency: 'Weekly',
    daysInterval: 7,
    color: '#E07A5F',
  },
  {
    id: 'close',
    name: 'Friends',
    description: 'Regular catch-ups',
    frequency: 'Monthly',
    daysInterval: 30,
    color: '#81B29A',
  },
  {
    id: 'catchup',
    name: 'Acquaintances',
    description: 'Occasional check-ins',
    frequency: 'Seasonal',
    daysInterval: 90,
    color: '#3D405B',
  },
];

export const INTERACTION_ICONS: Record<InteractionType, string> = {
  call: 'phone',
  text: 'chat',
  video_call: 'video',
  in_person: 'coffee',
  social_media: 'share-variant',
  email: 'email',
  other: 'dots-horizontal',
};

export const NOTE_TYPE_CONFIG: Record<NoteType, { icon: string; color: string; bgColor: string; label: string }> = {
  draft: { icon: 'sticky-note-2', color: '#E9C46A', bgColor: 'rgba(233, 196, 106, 0.2)', label: 'Draft' },
  memory: { icon: 'inventory-2', color: '#81B29A', bgColor: 'rgba(129, 178, 154, 0.1)', label: 'Memory' },
  gift_idea: { icon: 'card-giftcard', color: '#E07A5F', bgColor: '#F4F1DE', label: 'Gift Idea' },
  life_update: { icon: 'work', color: '#81B29A', bgColor: 'rgba(129, 178, 154, 0.1)', label: 'Life Update' },
};
