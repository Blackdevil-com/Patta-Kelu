import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { api } from "../api/client";
import { useAuthStore } from "../stores/authStore";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        identifier: identifier.trim(),
        password,
      });
      const data = res.data.data;
      login(data.user, data.accessToken);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setIdentifier("admin@pattakelu.com");
    setPassword("Admin@123");
  };

  const handleDemoUser = () => {
    setIdentifier("user@pattakelu.com");
    setPassword("User@123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="flex items-center space-x-4 mb-8">
        <img
          src="/logo.png"
          alt="Paata Kelu"
          className="w-16 h-16 object-contain rounded-full drop-shadow-[0_4px_20px_rgba(29,185,84,0.4)]"
        />
        <span className="text-3xl font-black tracking-tight text-white">PAATA KELU</span>
      </div>

      <div className="bg-spotify-darkGray border border-neutral-800 w-full max-w-md p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">Log in to Paata Kelu</h2>
          <p className="text-xs text-neutral-400">Welcome back! Stream music without limits.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or username"
              className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold py-3.5 rounded-full text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="pt-2 border-t border-neutral-800">
          <p className="text-[11px] text-neutral-400 text-center mb-2">Quick Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDemoAdmin}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-spotify-green transition-colors"
            >
              Demo Admin
            </button>
            <button
              onClick={handleDemoUser}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
            >
              Demo User
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-neutral-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-white font-bold hover:underline">
            Sign up for Paata Kelu
          </Link>
        </div>
      </div>
    </div>
  );
};
