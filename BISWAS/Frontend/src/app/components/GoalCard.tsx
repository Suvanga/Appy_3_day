import { CircleCheck, Circle, TrendingUp, Target, Trash2, Pencil } from "lucide-react";
import type { Goal, Habit } from "../types";

interface GoalCardProps {
  goal: Goal;
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onEditGoal: (goal: Goal) => void;
  onEditHabit: (habit: Habit) => void;
}

export function GoalCard({ goal, habits, onToggleHabit, onDeleteHabit, onEditGoal, onEditHabit }: GoalCardProps) {

  const today = new Date().toISOString().split("T")[0];
  // Filter for this goal, then auto-sort them so "growth" and "maintenance" are grouped together
  const goalHabits = habits
    .filter((h) => h.goalId === goal.id)
    .sort((a, b) => a.type.localeCompare(b.type));
  
  const completedToday = goalHabits.filter((h) =>
    h.completions.some((c) => c.date === today)
  ).length;
  
  const totalHabits = goalHabits.length;
  const completionPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // NEW SIMPLE MATH: Sum up all progress made across all habits for this specific goal
  const currentProgress = goalHabits.reduce((goalSum, habit) => {
    const habitSum = habit.completions.reduce((sum, completion) => {
      return sum + (completion.progress || 0);
    }, 0);
    return goalSum + habitSum;
  }, 0);

  // Target value (defaults to 100 for now until we update AddGoalDialog)
  const targetValue = 100;
  
  // Cap the circle at 100% so the visual ring doesn't break if they go over
  const circlePercentage = Math.min((currentProgress / targetValue) * 100, 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Goal Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} className="text-[#1E293B]" />
            <h2 className="text-xl text-[#1E293B] mr-2">{goal.name}</h2>
            <button onClick={() => onEditGoal(goal)} className="p-1 text-gray-400 hover:text-blue-500 transition-all opacity-0 group-hover:opacity-100" title="Edit Goal">
              <Pencil size={16} />
            </button>
          </div>
          {goal.description && (
            <p className="text-sm text-gray-600">{goal.description}</p>
          )}
        </div>
        
        {/* Progress Score Ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#E5E7EB"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#F97316"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(circlePercentage / 100) * 175.93} 175.93`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[#1E293B]">{currentProgress}</span>
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-1">Progress</span>
        </div>
      </div>

      {/* Today's Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">Today's Progress</span>
          <span className="text-[#1E293B]">{completedToday}/{totalHabits}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#F97316] to-[#FB923C] transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        {goalHabits.map((habit) => {
          const isCompletedToday = habit.completions.some((c) => c.date === today);
          const habitType = habit.type === "growth" ? "Growth" : "Maintenance";
          const habitColor = habit.type === "growth" ? "#F97316" : "#14B8A6";

          return (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <button
                onClick={() => onToggleHabit(habit.id)}
                className="transition-all hover:scale-110"
                style={{ color: isCompletedToday ? habitColor : "#94A3B8" }}
              >
                {isCompletedToday ? (
                  <CircleCheck size={24} fill="currentColor" />
                ) : (
                  <Circle size={24} />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[#1E293B]">{habit.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${habitColor}15`,
                      color: habitColor,
                    }}
                  >
                    {habitType}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onEditHabit(habit)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
                title="Edit Habit"
              >
                <Pencil size={16} />
              </button>
              {/* Delete Button for Habit */}
              <button 
                onClick={() => onDeleteHabit(habit.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all mr-2"
                title="Delete Habit"
              >
                <Trash2 size={16} />
              </button>

              {/* Streak indicator */}
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <TrendingUp size={14} />
                <span>{habit.completions.length}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}