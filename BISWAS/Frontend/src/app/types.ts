export interface Goal {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Completion {
  date: string;
  friction: number;
  note: string;
  progress?: number; // Optional field to track how much progress was made during this check-in
}

export interface Habit {
  id: string;
  goalId: string;
  name: string;
  description?: string;
  type: "growth" | "maintenance";
  completions: Completion[];
  createdAt: string;
  progress?: number; // Optional field to track overall progress for the habit
}
