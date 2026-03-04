import { useState, useEffect } from "react";
import { useAuth0 } from "../auth/mockAuth";
import { LayoutDashboard, Sparkles, Trash2, LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { GoalCard } from "../components/GoalCard";
import { AIInsights } from "../components/AIInsights";
import { AddGoalDialog } from "../components/AddGoalDialog";
import { FrictionModal } from "../components/FrictionModal";
import type { Goal, Habit } from "../types";

export function TrackerPage() {
  const { logout, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [activeTab, setActiveTab] = useState<"dashboard" | "insights">("dashboard");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);

  // 1. FETCH DATA FROM DATABASE (Replaces Local Storage Load)
  useEffect(() => {
    const fetchTrackerData = async () => {
      if (!isAuthenticated) return;

      try {
        const token = await getAccessTokenSilently();
        
        const response = await fetch("http://localhost:5002/api/goals", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
           // Ensure the frontend maps database 'title' to what the UI expects
           const mappedGoals = data.map(g => ({ ...g, name: g.title || g.name }));
           setGoals(mappedGoals);
           
           // Extract all habits from all goals into one flat array for the UI
           const allHabits = data.flatMap(goal => {
             return (goal.habits || []).map((h: any) => ({
               ...h,
               goalId: h.goal_id,
               completions: [] // UI state for today's completion
             }));
           });
           setHabits(allHabits);
        }
      } catch (error) {
        console.error("Failed to fetch data from database:", error);
      }
    };

    fetchTrackerData();
  }, [isAuthenticated, getAccessTokenSilently]);


  // 2. ADD GOAL TO DATABASE
  const addGoal = async (name: string, description: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:5002/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: name, // Backend expects 'title'
        }),
      });

      const newGoal = await response.json();
      setGoals([...goals, { ...newGoal, name: newGoal.title }]);
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  // 3. ADD HABIT TO DATABASE
  const addHabit = async (goalId: string, name: string, type: "growth" | "maintenance") => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:5002/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal_id: goalId,
          name,
          type,
          frequency: "daily"
        }),
      });

      const newHabit = await response.json();
      setHabits([...habits, { ...newHabit, goalId: newHabit.goal_id, completions: [] }]);
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  // 4. PREPARE HABIT CHECK-IN
  const toggleHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split("T")[0];
    const isCompletedToday = habit.completions.some((c) => c.date === today);

    if (isCompletedToday) {
      // Uncomplete locally (UI only for MVP)
      setHabits(
        habits.map((h) =>
          h.id === habitId
            ? { ...h, completions: h.completions.filter((c) => c.date !== today) }
            : h
        )
      );
    } else {
      // Show friction modal to complete
      setCheckInHabit(habit);
    }
  };

  // 5. SAVE HABIT CHECK-IN TO DATABASE
  const completeHabitWithFriction = async (friction: number, note: string) => {
    if (!checkInHabit) return;

    try {
      const token = await getAccessTokenSilently();
      const today = new Date().toISOString();

      await fetch(`http://localhost:5002/api/habits/${checkInHabit.id}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: true,
          friction_rating: friction,
          friction_note: note,
          date: today
        }),
      });

      // Update UI state
      const completionDate = today.split("T")[0];
      const completion = {
        date: completionDate,
        friction,
        note,
      };

      setHabits(
        habits.map((h) =>
          h.id === checkInHabit.id
            ? { ...h, completions: [...(h.completions || []), completion] }
            : h
        )
      );
      setCheckInHabit(null);
    } catch (error) {
      console.error("Failed to log habit check-in:", error);
    }
  };

  const deleteGoal = (goalId: string) => {
    if (confirm("Delete this goal and all its habits? (Local UI only for now)")) {
      setGoals(goals.filter((g) => g.id !== goalId));
      setHabits(habits.filter((h) => h.goalId !== goalId));
    }
  };

  // Calculate overall stats
  const todayDate = new Date().toISOString().split("T")[0];
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) =>
    (h.completions || []).some((c) => c.date === todayDate)
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