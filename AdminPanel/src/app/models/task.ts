export interface Task {
  id?: string;
  category: string;
  title: string;
  icon?: string;
  difficulty?: string;
  points?: number;
  description?: string;
  created_at?: string;
}

export interface TasksResponse {
  status: boolean;
  message: string;
  tasks: Task[];
}

export interface TaskRequest {
  task: Task;
  flag: string;
}