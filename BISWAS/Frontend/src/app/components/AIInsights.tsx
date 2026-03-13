import { useState, useEffect, useCallback } from "react";
import { Sparkles, TrendingDown, TrendingUp, Calendar, Clock, Loader2, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth0 } from "@auth0/auth0-react";
import type { Habit, Goal } from "../types";

interface AIInsightsProps {
  habits: Habit[];
  goals: Goal[];
}

export function AIInsights({ habits, goals }: AIInsightsProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [latestInsight, setLatestInsight] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("all");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const fetchInsights = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_BASE}/api/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        try {
          const parsedData = JSON.parse(data[0].insight_text);
          setLatestInsight(parsedData);
        } catch (e) {
          console.error("Could not parse AI JSON:", e);
        }
      }
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const generateNewInsight = async () => {
    setIsGenerating(true);
    try {
      const token = await getAccessTokenSilently();

      let url = `${API_BASE}/api/insights/generate`;
      if (selectedGoalId !== "all") {
        url += `?goalId=${selectedGoalId}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Could not generate: ${errorData.error}`);
        setIsGenerating(false);
        return;
      }
      await fetchInsights();
    } catch (error) {
      console.error("Failed to generate insight:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Filter habits based on the dropdown selection
  const filteredHabits = selectedGoalId === "all" 
    ? habits 
    : habits.filter(h => h.goalId === selectedGoalId);

  // Generate chart data using only the FILTERED habits
  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const completions = filteredHabits.reduce((count, habit) => {
        return count + (habit.completions.some(c => c.date === dateStr) ? 1 : 0);
      }, 0);

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completions,
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const displayCards = [
    {
      type: "pattern",
      icon: Calendar,
      title: "Pattern Recognition",
      description: latestInsight?.patternRecognition || "Log more habits to unlock your pattern insights! You've got this.",
      color: "#F97316"
    },
    {
      type: "growth",
      icon: TrendingUp,
      title: "Growth Momentum",
      description: latestInsight?.growthMomentum || "Every step counts. Build your momentum today!",
      color: "#10B981"
    },
    {
      type: "timing",
      icon: Clock,
      title: "Optimal Timing",
      description: latestInsight?.optimalTiming || "Keep tracking to find out exactly when you perform best.",
      color: "#14B8A6"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-[#F97316]" size={32} />
            <h2 className="text-3xl font-bold">AI Growth Coach</h2>
          </div>
          <p className="text-gray-300">Select a specific goal or analyze everything at once.</p>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#F97316] [&>option]:text-gray-900 cursor-pointer"
          >
            <option value="all">🧠 Analyze All Goals</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                🎯 {goal.name}
              </option>
            ))}
          </select>

          <button
            onClick={generateNewInsight}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#F97316] to-[#FB923C] hover:from-[#EA580C] hover:to-[#F97316] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <TrendingUp size={20} />}
            <span>{isGenerating ? "Analyzing Data..." : "Generate Insights"}</span>
          </button>
        </div>
      </div>

      {/* Consistency Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg text-[#1E293B] mb-4">
          {selectedGoalId === "all" ? "7-Day Overall Consistency Trend" : "7-Day Goal Consistency Trend"}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#94A3B8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey="completions" stroke="#F97316" strokeWidth={3} dot={{ fill: '#F97316', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insight Cards */}
      <div className="space-y-3">
        <h3 className="text-lg text-[#1E293B]">Smart Insights</h3>
        {displayCards.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${insight.color}15` }}>
                  <Icon size={24} style={{ color: insight.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#1E293B] font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats updated to use filteredHabits! */}
      <div className="grid grid-cols-2 gap-3 pb-8">
        <div className="bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-2xl p-5 text-white shadow-sm">
          <div className="text-4xl font-bold mb-1">{filteredHabits.reduce((sum, h) => sum + h.completions.length, 0)}</div>
          <div className="text-sm opacity-90 font-medium">Total Lifetime Completions</div>
        </div>
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#06B6D4] rounded-2xl p-5 text-white shadow-sm">
          <div className="text-4xl font-bold mb-1">{filteredHabits.length > 0 ? Math.round((filteredHabits.reduce((sum, h) => sum + h.completions.length, 0) / filteredHabits.length)) : 0}</div>
          <div className="text-sm opacity-90 font-medium">Average per Habit</div>
        </div>
      </div>
    </div>
  );
}