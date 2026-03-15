import { useState, useEffect } from "react";

interface TreeGamificationProps {
  completionsCount: number;
}

export function TreeGamification({ completionsCount }: TreeGamificationProps) {
  const [isWatering, setIsWatering] = useState(false);
  const [prevCount, setPrevCount] = useState(completionsCount);

  // Trigger the watering animation when completions increase
  useEffect(() => {
    if (completionsCount > prevCount) {
      // Only water if it's an actual new completion (not the initial page load)
      if (prevCount !== 0 || completionsCount === 1) {
        setIsWatering(true);
        // Turn off the rain after 2.5 seconds
        setTimeout(() => setIsWatering(false), 2500);
      }
    }
    setPrevCount(completionsCount);
  }, [completionsCount, prevCount]);

  // Math for leveling
  const level = Math.floor(completionsCount / 5) + 1;
  const progressToNextLevel = (completionsCount % 5) * 20;
  const completionsNeeded = 5 - (completionsCount % 5);

  // Smooth continuous growth within the level (scales up slightly as you get closer to next level)
  const intraLevelScale = 1 + (progressToNextLevel / 100) * 0.15;

  // Determine which visual stage the tree is in
  const renderTreeStage = () => {
    if (level === 1) {
      // Seed
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <ellipse cx="50" cy="85" rx="4" ry="3" fill="#8B4513" />
        </svg>
      );
    }
    if (level === 2) {
      // Sprout
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <path d="M50 85 Q45 65 50 60" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 65 Q40 60 45 55 Q50 60 50 65" fill="#10B981" />
          <path d="M50 62 Q60 55 55 50 Q50 55 50 62" fill="#10B981" />
        </svg>
      );
    }
    if (level === 3) {
      // Sapling
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <path d="M49 85 L51 85 L51 50 L49 50 Z" fill="#8B4513" />
          <circle cx="50" cy="45" r="15" fill="#10B981" opacity="0.9" />
          <circle cx="43" cy="50" r="10" fill="#059669" opacity="0.8" />
          <circle cx="57" cy="50" r="10" fill="#34D399" opacity="0.8" />
        </svg>
      );
    }
    if (level === 4) {
      // Young Tree
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <path d="M47 85 L53 85 L52 35 L48 35 Z" fill="#78350F" />
          <path d="M50 60 L40 50 L43 47 L50 55" fill="#78350F" />
          <path d="M50 50 L60 40 L57 37 L50 45" fill="#78350F" />
          <circle cx="50" cy="30" r="22" fill="#10B981" />
          <circle cx="35" cy="40" r="18" fill="#059669" />
          <circle cx="65" cy="40" r="18" fill="#34D399" />
          <circle cx="50" cy="20" r="15" fill="#047857" opacity="0.5" />
        </svg>
      );
    }
    // Mighty Oak (Level 5+)
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <path d="M45 85 L55 85 L53 25 L47 25 Z" fill="#451A03" />
        <path d="M47 70 L30 55 L34 50 L49 60" fill="#451A03" />
        <path d="M53 60 L70 45 L66 40 L51 50" fill="#451A03" />
        <path d="M49 45 L35 30 L39 26 L50 38" fill="#451A03" />
        <circle cx="50" cy="25" r="28" fill="#065F46" />
        <circle cx="25" cy="45" r="22" fill="#059669" />
        <circle cx="75" cy="45" r="22" fill="#10B981" />
        <circle cx="35" cy="25" r="20" fill="#34D399" opacity="0.9" />
        <circle cx="65" cy="25" r="20" fill="#047857" opacity="0.8" />
      </svg>
    );
  };

  const stageName = 
    level === 1 ? "Seed" : 
    level === 2 ? "Sprout" : 
    level === 3 ? "Sapling" : 
    level === 4 ? "Young Tree" : "Mighty Oak";

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
      
      {/* Custom Keyframes for Rain */}
      <style>
        {`
          @keyframes rainDrop {
            0% { transform: translateY(-50px) scale(1); opacity: 0; }
            10% { opacity: 1; }
            80% { transform: translateY(150px) scale(1); opacity: 1; }
            100% { transform: translateY(170px) scale(0); opacity: 0; }
          }
          .rain-animation { animation: rainDrop 0.8s linear infinite; }
        `}
      </style>

      {/* Watering / Rain Overlay */}
      {isWatering && (
        <div className="absolute inset-0 z-20 pointer-events-none flex justify-center gap-6 overflow-hidden bg-blue-50/20 transition-colors duration-500">
          <div className="w-1.5 h-6 bg-blue-400 rounded-full rain-animation" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-4 bg-blue-300 rounded-full rain-animation" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-1.5 h-5 bg-blue-500 rounded-full rain-animation" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-7 bg-blue-400 rounded-full rain-animation" style={{ animationDelay: '0.6s' }}></div>
          <div className="w-1.5 h-5 bg-blue-300 rounded-full rain-animation" style={{ animationDelay: '0.3s' }}></div>
        </div>
      )}

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      {/* Header Stats */}
      <div className="flex justify-between w-full max-w-md mb-4 px-4 text-sm font-bold text-gray-400 uppercase tracking-widest relative z-10">
        <span className="text-[#10B981]">Level {level}</span>
        <span>{completionsCount} Completions</span>
      </div>
      
      {/* The Tree Visual */}
      <div className="relative z-10 flex flex-col items-center justify-end h-48 w-full mt-4">
        <div 
          className="w-32 h-32 transition-all duration-1000 ease-in-out relative"
          style={{ 
            transform: `scale(${intraLevelScale})`, 
            transformOrigin: 'bottom center' 
          }}
        >
          {renderTreeStage()}
        </div>
        {/* Soil Base */}
        <div className="w-48 h-3 bg-[#D4D4D8] rounded-[50%] mt-[-4px] z-0"></div>
      </div>
      
      {/* Experience Bar */}
      <div className="mt-8 relative z-10 w-full flex flex-col items-center">
        <div className="text-xl font-bold text-[#1E293B]">
          {stageName} Stage
        </div>
        <div className="w-full max-w-md bg-gray-100 rounded-full h-3 mt-4 overflow-hidden shadow-inner relative">
          <div 
            className="bg-gradient-to-r from-[#10B981] to-[#34D399] h-full rounded-full transition-all duration-1000 ease-out relative" 
            style={{ width: `${progressToNextLevel === 0 && completionsCount > 0 ? 100 : progressToNextLevel}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-400 mt-3">
          {level >= 5 ? "Your roots are unshakeable!" : `Water ${completionsNeeded} more ${completionsNeeded === 1 ? 'time' : 'times'} to reach Level ${level + 1}!`}
        </p>
      </div>
    </div>
  );
}