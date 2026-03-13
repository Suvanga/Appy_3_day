import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LayoutDashboard, Sparkles, Trash2, LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { GoalCard } from "../components/GoalCard";
import { AIInsights } from "../components/AIInsights";
import { AddGoalDialog } from "../components/AddGoalDialog";
import { FrictionModal } from "../components/FrictionModal";
import type { Goal, Habit } from "../types";

// Dynamic API URL: Uses the .env value if it exists, otherwise defaults to local for dev
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function TrackerPage() {
  const { logout, getAccessTokenSilently } = useAuth0();
  const [activeTab, setActiveTab] = useState<"dashboard" | "insights">("dashboard");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);

  // 1. Fetch real data from your AWS Backend
  const loadData = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_BASE}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. Save a new Goal
  const addGoal = async (name: string, description: string) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${API_BASE}/api/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: name,
          description: description,
          target_value: 100, 
        })
      });
      loadData(); 
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Save a new Habit
  const addHabit = async (goalId: string, name: string, type: "growth" | "maintenance", description: string = "") => {    
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${API_BASE}/api/habits`, {
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
      loadData(); 
    } catch (e) {
      console.error(e);
    }
  };

  const toggleHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const today = new Date().toISOString().split("T")[0];
    const isCompletedToday = habit.completions.some((c) => c.date === today);
    if (!isCompletedToday) {
      setCheckInHabit(habit); 
    }
  };

  // 4. Save the Friction Log
  const completeHabitWithFriction = async (friction: number, note: string, progress: number) => {
    if (!checkInHabit) return;
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${API_BASE}/api/habits/${checkInHabit.id}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          friction_rating: friction,
          friction_note: note,
          progress_made: progress,
          date: new Date().toISOString()
        })
      });
      setCheckInHabit(null);
      loadData(); 
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (confirm("Delete this goal and all its habits?")) {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${API_BASE}/api/goals/${goalId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Failed to delete: ${errorData.error}`);
          return;
        }
        loadData(); 
      } catch (e) {
        console.error("Failed to reach backend:", e);
      }
    }
  };

  // Rendering logic remains same as your original...
  const todayDate = new Date().toISOString().split("T")[0];
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) =>
    h.completions.some((c) => c.date === todayDate)
  ).length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Rest of your JSX remains exactly the same */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-[#1E293B] mb-1">Momentum</h1>
              <p className="text-sm text-gray-600">Build habits that drive your goals</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors">
                <Home size={18} />
                <span>Home</span>
              </Link>
              <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
          {totalHabits > 0 && (
            <div className="mt-4 text-right">
              <span className="text-2xl text-[#1E293B]">{completionPercentage}% Today</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky top-[121px] z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${activeTab === "dashboard" ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-600"}`}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button onClick={() => setActiveTab("insights")} className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${activeTab === "insights" ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-600"}`}>
              <Sparkles size={18} /> AI Insights
            </button>
          </div>
        </div>
      </div>
 
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.id} className="relative group">
                <GoalCard goal={goal} habits={habits} onToggleHabit={toggleHabit} />
                <button onClick={() => deleteGoal(goal.id)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <AIInsights habits={habits} goals={goals} />
        )}
      </div>

      <AddGoalDialog onAddGoal={addGoal} onAddHabit={addHabit} goals={goals} />
      {checkInHabit && <FrictionModal habitName={checkInHabit.name} onComplete={completeHabitWithFriction} onCancel={() => setCheckInHabit(null)} />}
    </div>
  );
}