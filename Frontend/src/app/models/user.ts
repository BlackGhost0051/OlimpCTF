export interface CategoryStatistics {
  category: string;
  total_tasks: number;
  completed_tasks: number;
  total_points: number;
}

export interface UserProfile {
  name: string;
  lastname: string;
  login: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  bio: string;
  icon: string;
  isPrivate: boolean;
  statistics?: CategoryStatistics[];
}

export interface ShortUserProfile{
  login: string;
  icon: string;
}
