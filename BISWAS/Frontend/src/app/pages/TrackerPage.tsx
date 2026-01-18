import { useState, useEffect } from "react";
import { useAuth0 } from "../auth/mockAuth";
import { LayoutDashboard, Sparkles, Trash2, LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { GoalCard } from "../components/GoalCard";
import { AIInsights } from "../components/AIInsights";
import { AddGoalDialog } from "../components/AddGoalDialog";
import { FrictionModal } from "../components/FrictionModal";
import type{ Goal, Habit } from "../types";
import { generateId } from "../utils/generateId";

export function TrackerPage() {
  const { logout } = useAuth0();
  const [activeTab, setActiveTab] = useState<"dashboard" | "insights">("dashboard");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const storedGoals = localStorage.getItem("momentum-goals");
    const storedHabits = localStorage.getItem("momentum-habits");
    
    if (storedGoals) {
      try {
        setGoals(JSON.parse(storedGoals));
      } catch (e) {
        console.error("Failed to load goals:", e);
      }
    }
    
    if (storedHabits) {
      try {
        setHabits(JSON.parse(storedHabits));
      } catch (e) {
        console.error("Failed to load habits:", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (goals.length > 0 || localStorage.getItem("momentum-goals")) {
      localStorage.setItem("momentum-goals", JSON.stringify(goals));
    }
  }, [goals]);

  useEffect(() => {
    if (habits.length > 0 || localStorage.getItem("momentum-habits")) {
      localStorage.setItem("momentum-habits", JSON.stringify(habits));
    }
  }, [habits]);

  const addGoal = (name: string, description: string) => {
    const newGoal: Goal = {
      id: generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
    };
    setGoals([...goals, newGoal]);
  };

  const addHabit = (goalId: string, name: string, type: "growth" | "maintenance") => {
    const newHabit: Habit = {
      id: generateId(),
      goalId,
      name,
      type,
      completions: [],
      createdAt: new Date().toISOString(),
    };
    setHabits([...habits, newHabit]);
  };

  const toggleHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split("T")[0];
    const isCompletedToday = habit.completions.some((c) => c.date === today);

    if (isCompletedToday) {
      // Uncomplete
      setHabits(
        habits.map((h) =>
          h.id === habitId
            ? { ...h, completions: h.completions.filter((c) => c.date !== today) }
            : h
        )
      );
    } else {
      // Show friction modal
      setCheckInHabit(habit);
    }
  };

  const completeHabitWithFriction = (friction: number, note: string) => {
    if (!checkInHabit) return;

    const today = new Date().toISOString().split("T")[0];
    const completion = {
      date: today,
      friction,
      note,
    };

    setHabits(
      habits.map((h) =>
        h.id === checkInHabit.id
          ? { ...h, completions: [...h.completions, completion] }
          : h
      )
    );
    setCheckInHabit(null);
  };

  const deleteGoal = (goalId: string) => {
    if (confirm("Delete this goal and all its habits?")) {
      setGoals(goals.filter((g) => g.id !== goalId));
      setHabits(habits.filter((h) => h.goalId !== goalId));
    }
  };

  // Calculate overall stats
  const today = new Date().toISOString().split("T")[0];
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) =>
    h.completions.some((c) => c.date === today)
  ).length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-[#1E293B] mb-1">Momentum</h1>
              <p className="text-sm text-gray-600">Build habits that drive your goals</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {totalHabits > 0 && (
            <div className="mt-4">
              <div className="text-right mb-2">
                <span className="text-2xl text-[#1E293B]">{completionPercentage}%</span>
                <span className="text-xs text-gray-600 ml-2">Today's Progress</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-[121px] z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                activeTab === "dashboard"
                  ? "border-[#F97316] text-[#F97316]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                activeTab === "insights"
                  ? "border-[#F97316] text-[#F97316]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Sparkles size={18} />
              <span>AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {activeTab === "dashboard" ? (
          <>
            {goals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm max-w-md mx-auto mt-12">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LayoutDashboard size={32} className="text-white" />
                </div>
                <h3 className="text-xl text-[#1E293B] mb-2">Start Your Journey</h3>
                <p className="text-gray-600 mb-6">
                  Create your first goal and start building habits that matter
                </p>
                <div className="text-sm text-gray-500 space-y-2">
                  <p>💡 Tip: Start with one big goal</p>
                  <p>🎯 Then add daily habits to reach it</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map((goal) => (
                  <div key={goal.id} className="relative group">
                    <GoalCard
                      goal={goal}
                      habits={habits}
                      onToggleHabit={toggleHabit}
                    />
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <AIInsights habits={habits} />
        )}
      </div>

      {/* Add Button */}
      <AddGoalDialog
        onAddGoal={addGoal}
        onAddHabit={addHabit}
        goals={goals}
      />

      {/* Friction Modal */}
      {checkInHabit && (
        <FrictionModal
          habitName={checkInHabit.name}
          onComplete={completeHabitWithFriction}
          onCancel={() => setCheckInHabit(null)}
        />
      )}
    </div>
  );
}