export interface Task {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  dueDate?: string; // ISO date string
}

export type FilterStatus = 'all' | 'completed' | 'incomplete';