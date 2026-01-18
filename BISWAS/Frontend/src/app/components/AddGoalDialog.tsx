import { useState } from "react";
import { Plus, X, Target, Zap, Shield } from "lucide-react";

interface AddGoalDialogProps {
  onAddGoal: (name: string, description: string) => void;
  onAddHabit: (goalId: string, name: string, type: "growth" | "maintenance") => void;
  goals: Array<{ id: string; name: string }>;
}

export function AddGoalDialog({ onAddGoal, onAddHabit, goals }: AddGoalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"goal" | "habit">("habit");
  
  // Goal form
  const [goalName, setGoalName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  
  // Habit form
  const [habitName, setHabitName] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [habitType, setHabitType] = useState<"growth" | "maintenance">("growth");

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalName.trim()) {
      onAddGoal(goalName.trim(), goalDescription.trim());
      setGoalName("");
      setGoalDescription("");
      setIsOpen(false);
    }
  };

  const handleSubmitHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitName.trim() && selectedGoalId) {
      onAddHabit(selectedGoalId, habitName.trim(), habitType);
      setHabitName("");
      setHabitType("growth");
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group hover:scale-110 z-40"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-[#1E293B]">Add New</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setMode("habit")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === "habit"
                ? "bg-white shadow-sm text-[#1E293B]"
                : "text-gray-600"
            }`}
          >
            Habit
          </button>
          <button
            onClick={() => setMode("goal")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === "goal"
                ? "bg-white shadow-sm text-[#1E293B]"
                : "text-gray-600"
            }`}
          >
            Goal
          </button>
        </div>

        {mode === "goal" ? (
          <form onSubmit={handleSubmitGoal} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Goal Name</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g., Run a Marathon"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Description (Optional)</label>
              <textarea
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="What's the bigger picture?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
                rows={2}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#1E293B] to-[#334155] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              disabled={!goalName.trim()}
            >
              Create Goal
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitHabit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Habit Name</label>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g., 5k Run"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Related Goal</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] bg-white"
              >
                <option value="">Select a goal...</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Habit Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHabitType("growth")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    habitType === "growth"
                      ? "border-[#F97316] bg-[#F97316]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Zap
                    className="mx-auto mb-2"
                    size={24}
                    color={habitType === "growth" ? "#F97316" : "#94A3B8"}
                  />
                  <div className="text-sm text-[#1E293B]">Growth</div>
                  <div className="text-xs text-gray-600">Push yourself</div>
                </button>
                <button
                  type="button"
                  onClick={() => setHabitType("maintenance")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    habitType === "maintenance"
                      ? "border-[#14B8A6] bg-[#14B8A6]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Shield
                    className="mx-auto mb-2"
                    size={24}
                    color={habitType === "maintenance" ? "#14B8A6" : "#94A3B8"}
                  />
                  <div className="text-sm text-[#1E293B]">Maintain</div>
                  <div className="text-xs text-gray-600">Stay consistent</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#1E293B] to-[#334155] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              disabled={!habitName.trim() || !selectedGoalId}
            >
              Add Habit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
