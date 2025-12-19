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
