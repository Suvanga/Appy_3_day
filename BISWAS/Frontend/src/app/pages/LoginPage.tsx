import { useAuth0 } from "../auth/mockAuth";
import { LogIn } from "lucide-react";

export function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-white" size={40} />
            </div>
            <h1 className="text-3xl text-[#1E293B] mb-2">Momentum</h1>
            <p className="text-gray-600">Build better habits, achieve your goals</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => loginWithRedirect()}
              className="w-full py-4 bg-gradient-to-r from-[#1E293B] to-[#334155] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <LogIn size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-lg">Sign In with Auth0</span>
            </button>

            <div className="text-center text-sm text-gray-500 pt-4">
              <p>Secure authentication powered by Auth0</p>
              <p className="mt-2">Track habits • Set goals • Stay motivated</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center space-y-2">
              <p>🎯 Goal-oriented habit tracking</p>
              <p>📊 AI-powered insights</p>
              <p>🔥 Streak & progress monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
