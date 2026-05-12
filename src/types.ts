
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';
export type TaskStatus = 'todo' | 'done' | 'hold' | 'cancelled';
export type ViewMode = 'tasks' | 'calendar' | 'settings';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  owner: string;
  dueDate: string; // ISO string
  status: TaskStatus;
  holdReason?: string;
  comments?: string[];
  reminderTriggered: boolean;
  createdAt: string;
  recurrence?: RecurrenceType;
}

export interface Settings {
  language: Language;
  theme: Theme;
  reminderSound: string; // Base64 or URL
}
