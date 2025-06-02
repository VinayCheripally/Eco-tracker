export interface Activity {
  id: string;
  description: string;
  date: string;
  carbonImpact: number;
  category: ActivityCategory;
  createdAt: string;
}

export type ActivityCategory = 
  | 'transportation' 
  | 'food' 
  | 'energy' 
  | 'shopping' 
  | 'other';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  category: ActivityCategory;
  iconName: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  totalRequired: number;
}

export interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: ActivityCategory;
}

export interface UserStats {
  dailyFootprint: number;
  weeklyFootprint: number;
  monthlyFootprint: number;
  streak: number;
  activitiesLogged: number;
  improvementRate: number;
}