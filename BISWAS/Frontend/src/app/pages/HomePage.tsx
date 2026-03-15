import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Calendar, LogOut, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// We keep this as a "fallback" just in case the API fails
const FALLBACK_QUOTES = [
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function HomePage() {
  const { user, logout, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // New State for dynamic quotes
  const [quote, setQuote] = useState({ quote: "", author: "" });
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);

  // 1. Fetch Dynamic Quote from API
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // ZenQuotes provides a random quote endpoint that does not require an API key
        // We use a proxy URL to avoid CORS issues on the frontend
        const response = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://zenquotes.io/api/random"));
        const data = await response.json();
        const parsedData = JSON.parse(data.contents);
        
        setQuote({
          quote: parsedData[0].q,
          author: parsedData[0].a
        });
      } catch (error) {
        console.error("Failed to fetch quote, using fallback:", error);
        // If the API fails, pick a random one from our fallback array
        setQuote(FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    fetchQuote();
  }, []);

  // 2. Sync User to Backend
  useEffect(() => {
    const syncUserToBackend = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`${API_BASE}/api/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              auth0_id: user.sub,
              email: user.email,
            }),
          });
          const data = await response.json();
          console.log("Cloud User Sync:", data);
        } catch (error) {
          console.error("Failed to sync user to backend:", error);
        }
      }
    };

    syncUserToBackend();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // 3. Clock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
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

              {/* Dynamic Quote Section */}
              <div className="max-w-2xl mx-auto pt-6 border-t border-gray-100 min-h-[120px] flex flex-col justify-center">
                {isLoadingQuote ? (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#F97316]" />
                    <p className="text-sm">Fetching inspiration...</p>
                  </div>
                ) : (
                  <>
                    <blockquote className="text-xl text-[#1E293B] mb-3 italic transition-opacity duration-500">
                      "{quote.quote}"
                    </blockquote>
                    <cite className="text-gray-600 not-italic">— {quote.author}</cite>
                  </>
                )}
              </div>

            </div>
          </div>

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