
export interface Domain {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number; // 0-100
  currentIdentity?: string;
  isLogged: boolean;
}

export interface Identity {
  id: string;
  name: string;
  description: string;
  domain: string;
  icon: string;
}

export interface DailyLog {
  id: string;
  date: string;
  domainId: string;
  presence: number; // 0-100 slider value
  notes?: string;
}

export interface QuarterlyCommitment {
  id: string;
  domainId: string;
  identityId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type VisualizationStyle = 'direct' | 'archetype' | 'growth';

export interface UserPreferences {
  visualizationStyle: VisualizationStyle;
  notificationsEnabled: boolean;
  reminderTime: string;
}
