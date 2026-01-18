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
}

export interface Habit {
  id: string;
  goalId: string;
  name: string;
  type: "growth" | "maintenance";
  completions: Completion[];
  createdAt: string;
}
