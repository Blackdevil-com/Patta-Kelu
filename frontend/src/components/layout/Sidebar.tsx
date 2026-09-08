import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Library, Heart, PlusSquare, Shield } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../api/client";
import { Playlist } from "../../types";

interface SidebarProps {
  onOpenCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreatePlaylist }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/playlists/me?size=20")
        .then((res) => setPlaylists(res.data.data.content))
        .catch(() => {});
    } else {
      setPlaylists([]);
    }
  }, [isAuthenticated]);

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Search", path: "/search", icon: Search },
    { label: "Your Library", path: "/library", icon: Library },
  ];

  return (
    <aside className="w-64 bg-black flex flex-col h-full border-r border-spotify-darkGray select-none hidden md:flex">
      {/* Brand Logo */}
      <div className="p-6 flex items-center space-x-3.5">
        <img
          src="/logo.png"
          alt="Paata Kelu"
          className="w-14 h-14 object-contain rounded-full drop-shadow-[0_4px_16px_rgba(29,185,84,0.35)] hover:scale-105 transition-transform flex-shrink-0"
        />
        <div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-spotify-green bg-clip-text text-transparent leading-none">
            PAATA KELU
          </span>
          <span className="block text-[10px] text-spotify-textMuted uppercase font-bold tracking-widest mt-1">
            AUDIO STREAM
          </span>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-spotify-lightGray text-white"
                  : "text-spotify-textMuted hover:text-white hover:bg-spotify-darkGray"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-spotify-green" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="my-4 border-t border-neutral-800 mx-4" />

      {/* Actions (Create Playlist & Liked Songs) */}
      <div className="px-3 space-y-1">
        <button
          onClick={onOpenCreatePlaylist}
          className="w-full flex items-center space-x-4 px-4 py-2.5 rounded-lg text-sm font-semibold text-spotify-textMuted hover:text-white hover:bg-spotify-darkGray transition-colors"
        >
          <div className="w-6 h-6 rounded bg-neutral-300 flex items-center justify-center text-black">
            <PlusSquare className="w-4 h-4" />
          </div>
          <span>Create Playlist</span>
        </button>

        <Link
          to="/liked-songs"
          className={`flex items-center space-x-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            location.pathname === "/liked-songs"
              ? "bg-spotify-lightGray text-white"
              : "text-spotify-textMuted hover:text-white hover:bg-spotify-darkGray"
          }`}
        >
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-600 to-blue-400 flex items-center justify-center text-white">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          <span>Liked Songs</span>
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center space-x-4 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname.startsWith("/admin")
                ? "bg-spotify-lightGray text-spotify-green"
                : "text-spotify-textMuted hover:text-white hover:bg-spotify-darkGray"
            }`}
          >
            <Shield className="w-5 h-5 text-spotify-green" />
            <span>Admin Console</span>
          </Link>
        )}
      </div>

      <div className="my-3 border-t border-neutral-800 mx-4" />

      {/* User's Created Playlists Scrollable List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin scrollbar-thumb-neutral-800">
        <span className="text-xs font-bold text-neutral-400 tracking-wider uppercase px-2">
          Playlists
        </span>
        {playlists.length === 0 ? (
          <div className="px-2 py-4 text-xs text-neutral-500">
            {isAuthenticated ? "No playlists created yet." : "Sign in to see your playlists."}
          </div>
        ) : (
          playlists.map((pl) => (
            <Link
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className="block truncate px-2 py-1.5 text-sm text-spotify-textMuted hover:text-white transition-colors"
            >
              {pl.name}
            </Link>
          ))
        )}
      </div>
    </aside>
  );
};
