export interface Task {
    id?: string;
    category: string;
    title: string;
    author?: number;
    icon?: string;
    difficulty?: string;
    points?: number;
    description?: string;
}