import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LayoutDashboard, Sparkles, Trash2, LogOut, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { GoalCard } from "../components/GoalCard";
import { AIInsights } from "../components/AIInsights";
import { AddGoalDialog } from "../components/AddGoalDialog";
import { FrictionModal } from "../components/FrictionModal";
import { TreeGamification } from "../components/TreeGamification";
import type { Goal, Habit } from "../types";

// Dynamic API URL: Uses the .env value if it exists, otherwise defaults to local for dev
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function TrackerPage() {
  const { logout, getAccessTokenSilently } = useAuth0();
  const [activeTab, setActiveTab] = useState<"dashboard" | "insights">("dashboard");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkInHabit, setCheckInHabit] = useState<Habit | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

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
      loadData(); // This re-fetches data, increasing total completions, triggering the rain!
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

  const deleteHabit = async (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${API_BASE}/api/habits/${habitId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          alert("Failed to delete habit");
          return;
        }
        loadData(); 
      } catch (e) {
        console.error("Failed to delete habit:", e);
      }
    }
  };

  const saveGoalEdit = async (goalId: string, newTitle: string, newDesc: string) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${API_BASE}/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, description: newDesc })
      });
      setEditingGoal(null);
      loadData();
    } catch (e) { console.error("Failed to update goal:", e); }
  };

  const saveHabitEdit = async (habitId: string, newName: string, newType: string) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`${API_BASE}/api/habits/${habitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, type: newType })
      });
      setEditingHabit(null);
      loadData();
    } catch (e) { console.error("Failed to update habit:", e); }
  };

  const todayDate = new Date().toISOString().split("T")[0];
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) =>
    h.completions.some((c) => c.date === todayDate)
  ).length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // NEW: Calculate total lifetime completions to pass into the Tree component
  const totalLifetimeCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
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
            
            {/* NEW: Tree Gamification added to the top of the dashboard */}
            <div className="mb-8">
              <TreeGamification completionsCount={totalLifetimeCompletions} />
            </div>

            {goals.map((goal) => (
              <div key={goal.id} className="relative group">
                <GoalCard 
                  goal={goal} 
                  habits={habits} 
                  onToggleHabit={toggleHabit} 
                  onDeleteHabit={deleteHabit}
                  onEditGoal={(g) => setEditingGoal(g)}
                  onEditHabit={(h) => setEditingHabit(h)}
                />
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

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#1E293B]">Edit Goal</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveGoalEdit(editingGoal.id, formData.get("title") as string, formData.get("description") as string);
            }}>
              <input name="title" defaultValue={editingGoal.name} required className="w-full px-4 py-3 rounded-xl border mb-3 focus:ring-2 focus:ring-[#F97316] outline-none" placeholder="Goal Title" />
              <input name="description" defaultValue={editingGoal.description} className="w-full px-4 py-3 rounded-xl border mb-5 focus:ring-2 focus:ring-[#F97316] outline-none" placeholder="Target / Description" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingGoal(null)} className="flex-1 px-4 py-3 rounded-xl border font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-[#F97316] text-white font-medium hover:bg-[#EA580C]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#1E293B]">Edit Habit</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveHabitEdit(editingHabit.id, formData.get("name") as string, formData.get("type") as string);
            }}>
              <input name="name" defaultValue={editingHabit.name} required className="w-full px-4 py-3 rounded-xl border mb-3 focus:ring-2 focus:ring-[#F97316] outline-none" placeholder="Habit Name" />
              <select name="type" defaultValue={editingHabit.type} className="w-full px-4 py-3 rounded-xl border mb-5 focus:ring-2 focus:ring-[#F97316] outline-none bg-white">
                <option value="growth">Growth (Building a new habit)</option>
                <option value="maintenance">Maintenance (Keeping a baseline)</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingHabit(null)} className="flex-1 px-4 py-3 rounded-xl border font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-[#F97316] text-white font-medium hover:bg-[#EA580C]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}