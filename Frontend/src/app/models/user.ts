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
}

export interface ShortUserProfile{
  login: string;
  icon: string;
}
