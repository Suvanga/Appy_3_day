import { useState } from "react";
import { X, CheckCircle } from "lucide-react";

interface FrictionModalProps {
  habitName: string;
  onComplete: (friction: number, note: string) => void;
  onCancel: () => void;
}

export function FrictionModal({ habitName, onComplete, onCancel }: FrictionModalProps) {
  const [friction, setFriction] = useState(3);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    onComplete(friction, note);
  };

  const frictionLabels = ["Very Easy", "Easy", "Moderate", "Hard", "Very Hard"];
  const frictionColors = ["#10B981", "#84CC16", "#F59E0B", "#F97316", "#EF4444"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-[#1E293B]">Check-In</h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg text-[#1E293B] mb-2">{habitName}</h3>
          <p className="text-sm text-gray-600">How difficult was it today?</p>
        </div>

        {/* Friction Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Difficulty Level</span>
            <span 
              className="text-sm px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: `${frictionColors[friction - 1]}20`,
                color: frictionColors[friction - 1]
              }}
            >
              {frictionLabels[friction - 1]}
            </span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="5"
              value={friction}
              onChange={(e) => setFriction(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${frictionColors[0]} 0%, ${frictionColors[1]} 25%, ${frictionColors[2]} 50%, ${frictionColors[3]} 75%, ${frictionColors[4]} 100%)`
              }}
            />
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: white;
                border: 3px solid ${frictionColors[friction - 1]};
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              }
              input[type="range"]::-moz-range-thumb {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: white;
                border: 3px solid ${frictionColors[friction - 1]};
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              }
            `}</style>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Optional Note */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            What made it {friction >= 4 ? "challenging" : "easier"}? (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Tired from work, felt energized after coffee..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
            rows={3}
          />
        </div>

        {/* Complete Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-gradient-to-r from-[#1E293B] to-[#334155] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-lg">Complete Habit</span>
        </button>
      </div>
    </div>
  );
}
