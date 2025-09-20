export interface Task {
  id?: string;
  title: string;
  icon: string;

  category: string;
  author?: string;
  difficulty: string;
  points: number;
  description: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  hints?: any;
}
