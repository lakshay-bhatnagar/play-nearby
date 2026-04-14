export interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  fitnessLevel: number; // 0-100
  sports: SportExperience[];
  avatarUrl?: string;
}

export interface SportExperience {
  sport: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Game {
  id: string;
  sport: string;
  title: string;
  location: string;
  distance: string;
  dateTime: string;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  hostName: string;
  hostAvatar: string;
  isLive: boolean;
  intensity: 'low' | 'medium' | 'high';
}

export const SPORTS = [
  'Basketball', 'Football', 'Tennis', 'Badminton', 'Cricket',
  'Swimming', 'Running', 'Cycling', 'Volleyball', 'Table Tennis',
  'Squash', 'Padel', 'Yoga', 'Boxing', 'Golf',
] as const;

export const SPORT_ICONS: Record<string, string> = {
  Basketball: '🏀',
  Football: '⚽',
  Tennis: '🎾',
  Badminton: '🏸',
  Cricket: '🏏',
  Swimming: '🏊',
  Running: '🏃',
  Cycling: '🚴',
  Volleyball: '🏐',
  'Table Tennis': '🏓',
  Squash: '🎯',
  Padel: '🎾',
  Yoga: '🧘',
  Boxing: '🥊',
  Golf: '⛳',
};
