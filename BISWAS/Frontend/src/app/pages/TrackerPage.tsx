import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LayoutDashboard, Sparkles, Trash2, LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { GoalCard } from "../components/GoalCard";
import { AIInsights } from "../components/AIInsights";
import { AddGoalDialog } from "../components/AddGoalDialog";
import { FrictionModal } from "../components/FrictionModal";
import type { Goal, Habit } from "../types";

export function TrackerPage() {
  const { logout, getAccessTokenSilently } = useAuth0();
  const [activeTab, setActiveTab] = useState<"dashboard" | "insights">("dashboard");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);

  // 1. Fetch real data from your Supabase Backend
  const loadData = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:5002/api/goals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      // Map the backend Database schema to match your existing Frontend components
      if (Array.isArray(data)) {
        const mappedGoals = data.map((g: any) => ({
          id: g.id,
          name: g.title,
          description: `Target: ${g.target_value}`,
          createdAt: g.deadline || new Date().toISOString(),
        }));
        
        const mappedHabits = data.flatMap((g: any) => 
          (g.habits || []).map((h: any) => ({
            id: h.id,
            goalId: h.goal_id,
            name: h.name,
            type: h.type,
            description: h.description,
            completions: h.logs ? h.logs.map((l: any) => ({ 
              date: l.date.split('T')[0], 
              friction: l.friction_rating, 
              note: l.friction_note,
              progress: l.progress_made || 1 
            })) : [],
            createdAt: h.created_at,
          }))
        );

        setGoals(mappedGoals);
        setHabits(mappedHabits);
      }
    } catch (error) {
      console.error("Failed to load data from backend:", error);
    }
  }, [getAccessTokenSilently]);

  // Load data immediately when the page opens
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Save a new Goal directly to the Database
  const addGoal = async (name: string, description: string) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch("http://localhost:5002/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: name,
          description: description,
          target_value: 100, // We will update AddGoalDialog to ask for this later!
        })
      });
      loadData(); // Refresh UI after saving
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Save a new Habit directly to the Database
const addHabit = async (goalId: string, name: string, type: "growth" | "maintenance", description: string = "") => {    try {
      const token = await getAccessTokenSilently();
      await fetch("http://localhost:5002/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          goal_id: goalId,
          name,
          description,
          type,
          frequency: "daily"
        })
      });
      loadData(); // Refresh UI after saving
    } catch (e) {
      console.error(e);
    }
  };

  // Triggered when clicking a habit checkbox
  const toggleHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split("T")[0];
    const isCompletedToday = habit.completions.some((c) => c.date === today);

    if (!isCompletedToday) {
      setCheckInHabit(habit); // Open the friction modal
    } else {
      console.log("Habit already checked in today! (Un-check feature coming soon)");
    }
  };

  // 4. Save the Friction Log to the Database!
 // 1. Add 'progress: number' to the parameters
  const completeHabitWithFriction = async (friction: number, note: string, progress: number) => {
    if (!checkInHabit) return;

    try {
      const token = await getAccessTokenSilently();
      await fetch(`http://localhost:5002/api/habits/${checkInHabit.id}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          friction_rating: friction,
          friction_note: note,
          progress_made: progress, // 2. Pass the dynamic progress variable here!
          date: new Date().toISOString()
        })
      });
      
      setCheckInHabit(null);
      loadData(); // Refresh the chart with the new data!
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (confirm("Delete this goal and all its habits?")) {
      try {
        const token = await getAccessTokenSilently();
        
        const response = await fetch(`http://localhost:5002/api/goals/${goalId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        // NEW: If the backend returns an error (like 404 or 500), catch it!
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend refused to delete! Reason:", errorData);
          alert(`Failed to delete: ${errorData.error}`);
          return; // Stop the function here so it doesn't run loadData()
        }
        
        loadData(); 
      } catch (e) {
        console.error("Failed to reach backend:", e);
      }
    }
  };

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
          <AIInsights habits={habits} goals={goals} />
        )}
      </div>

      <AddGoalDialog
        onAddGoal={addGoal}
        onAddHabit={addHabit}
        goals={goals}
      />

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