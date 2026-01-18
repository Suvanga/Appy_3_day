import { Sparkles, TrendingDown, TrendingUp, Calendar, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Habit } from "../types";

interface AIInsightsProps {
  habits: Habit[];
}

export function AIInsights({ habits }: AIInsightsProps) {
  // Generate mock insights based on actual data
  const generateInsights = () => {
    const insights = [];
    
    // Analyze completion patterns by day of week
    const dayCompletions: { [key: string]: number } = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
    };
    
    habits.forEach(habit => {
      habit.completions.forEach(completion => {
        const date = new Date(completion.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayCompletions[dayName]++;
      });
    });

    const weakestDay = Object.entries(dayCompletions).reduce((min, [day, count]) => 
      count < min[1] ? [day, count] : min
    , ['Sunday', Infinity])[0];

    const strongestDay = Object.entries(dayCompletions).reduce((max, [day, count]) => 
      count > max[1] ? [day, count] : max
    , ['Sunday', 0])[0];

    if (habits.length > 0) {
      insights.push({
        type: "pattern",
        icon: Calendar,
        title: "Weekly Pattern Detected",
        description: `You're most consistent on ${strongestDay}s and struggle on ${weakestDay}s. Consider scheduling important habits on your strongest days.`,
        color: "#F97316"
      });
    }

    // Analyze friction patterns
    const highFrictionHabits = habits.filter(h => {
      const recentFriction = h.completions.slice(-7).map(c => c.friction || 3);
      const avgFriction = recentFriction.reduce((a, b) => a + b, 0) / recentFriction.length;
      return avgFriction > 3.5;
    });

    if (highFrictionHabits.length > 0) {
      insights.push({
        type: "friction",
        icon: TrendingDown,
        title: "High Friction Alert",
        description: `"${highFrictionHabits[0].name}" has been challenging lately. Your notes suggest breaking it into smaller steps might help.`,
        color: "#EF4444"
      });
    }

    // Growth insights
    const growthHabits = habits.filter(h => h.type === "growth");
    if (growthHabits.length > 0) {
      const totalGrowthCompletions = growthHabits.reduce((sum, h) => sum + h.completions.length, 0);
      insights.push({
        type: "growth",
        icon: TrendingUp,
        title: "Growth Momentum",
        description: `You've completed ${totalGrowthCompletions} growth-focused activities. You're 23% more consistent with growth habits than last week.`,
        color: "#10B981"
      });
    }

    // Time-based insight
    insights.push({
      type: "timing",
      icon: Clock,
      title: "Optimal Timing",
      description: "Your completion rate is 40% higher in the morning. Try scheduling new habits before noon for best results.",
      color: "#14B8A6"
    });

    return insights;
  };

  // Generate chart data for last 7 days
  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const completions = habits.reduce((count, habit) => {
        return count + (habit.completions.some(c => c.date === dateStr) ? 1 : 0);
      }, 0);

      const avgFriction = habits.reduce((sum, habit) => {
        const completion = habit.completions.find(c => c.date === dateStr);
        return sum + (completion?.friction || 0);
      }, 0) / (completions || 1);

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completions,
        friction: avgFriction,
      });
    }
    return data;
  };

  const insights = generateInsights();
  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-xl">
          <Sparkles className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl text-[#1E293B]">AI Growth Coach</h2>
          <p className="text-sm text-gray-600">Personalized insights from your habit data</p>
        </div>
      </div>

      {/* Consistency Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg text-[#1E293B] mb-4">7-Day Consistency Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#94A3B8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line
              type="monotone"
              dataKey="completions"
              stroke="#F97316"
              strokeWidth={3}
              dot={{ fill: '#F97316', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insight Cards */}
      <div className="space-y-3">
        <h3 className="text-lg text-[#1E293B]">Smart Insights</h3>
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${insight.color}15` }}
                >
                  <Icon size={20} style={{ color: insight.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#1E293B] mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-2xl p-5 text-white">
          <div className="text-3xl mb-1">
            {habits.reduce((sum, h) => sum + h.completions.length, 0)}
          </div>
          <div className="text-sm opacity-90">Total Completions</div>
        </div>
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#06B6D4] rounded-2xl p-5 text-white">
          <div className="text-3xl mb-1">
            {Math.round((habits.reduce((sum, h) => sum + h.completions.length, 0) / Math.max(habits.length, 1)))}
          </div>
          <div className="text-sm opacity-90">Avg per Habit</div>
        </div>
      </div>
    </div>
  );
}
