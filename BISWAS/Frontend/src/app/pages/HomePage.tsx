import { useState, useEffect } from "react";
import { useAuth0 } from "../auth/mockAuth";
import { Calendar, LogOut, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const MOTIVATIONAL_QUOTES = [
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    quote: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    quote: "Your limitation—it's only your imagination.",
    author: "Unknown"
  },
  {
    quote: "Great things never come from comfort zones.",
    author: "Unknown"
  },
];

export function HomePage() {
  const { user, logout } = useAuth0();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl text-[#1E293B]">Momentum</h1>
                <p className="text-xs text-gray-600">Build better habits</p>
              </div>
            </div>
            
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#1E293B] hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Greeting & Time Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center space-y-4">
              <h2 className="text-2xl text-gray-600">{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!</h2>
              
              <div className="py-6">
                <div className="text-6xl md:text-7xl text-[#1E293B] mb-2 tabular-nums">
                  {formatTime(currentTime)}
                </div>
                <div className="text-lg text-gray-600">
                  {formatDate(currentTime)}
                </div>
              </div>

              <div className="max-w-2xl mx-auto pt-6 border-t border-gray-100">
                <blockquote className="text-xl text-[#1E293B] mb-3 italic">
                  "{quote.quote}"
                </blockquote>
                <cite className="text-gray-600 not-italic">— {quote.author}</cite>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-16 h-16 rounded-full border-2 border-[#F97316]"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg text-[#1E293B]">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center">
            <Link
              to="/tracker"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1E293B] to-[#334155] text-white rounded-xl hover:shadow-lg transition-all group"
            >
              <Calendar size={24} />
              <span className="text-lg">Go to Habit Tracker</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <div className="text-3xl text-[#F97316] mb-2">🎯</div>
              <div className="text-2xl text-[#1E293B] mb-1">Goals</div>
              <div className="text-sm text-gray-600">Set & Track Your Objectives</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <div className="text-3xl text-[#14B8A6] mb-2">📊</div>
              <div className="text-2xl text-[#1E293B] mb-1">Insights</div>
              <div className="text-sm text-gray-600">AI-Powered Analytics</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <div className="text-3xl text-[#1E293B] mb-2">🔥</div>
              <div className="text-2xl text-[#1E293B] mb-1">Streaks</div>
              <div className="text-sm text-gray-600">Build Consistency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
