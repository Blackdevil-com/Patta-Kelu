import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../stores/authStore";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/register", {
        email: email.trim(),
        username: username.trim(),
        displayName: displayName.trim(),
        password,
      });
      const data = res.data.data;
      login(data.user, data.accessToken);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-white">Sign up to start listening</h2>
          <p className="text-xs text-neutral-400">Join millions of music lovers on Paata Kelu.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Username *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Unique handle (e.g. musicfan99)"
              className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              What should we call you? *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Create Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold py-3.5 rounded-full text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-neutral-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
