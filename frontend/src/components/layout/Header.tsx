import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Shield, Camera } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { AvatarSelectModal } from "../modals/AvatarSelectModal";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  return (
    <>
      <header className="h-16 bg-spotify-darkGray/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 border-b border-neutral-800/50">
        {/* History Navigation Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* User Actions / Profile Dropdown */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 bg-black/70 hover:bg-spotify-lightGray py-1.5 px-3 rounded-full border border-neutral-700/60 transition-colors"
              >
                <img
                  src={user.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full object-cover border border-spotify-green/40"
                />
                <span className="text-sm font-semibold max-w-[120px] truncate">{user.displayName}</span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-spotify-darkGray border border-neutral-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-neutral-800">
                    <p className="text-xs text-neutral-400">Signed in as</p>
                    <p className="text-sm font-bold truncate text-white">{user.username}</p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setAvatarModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-neutral-300 hover:bg-spotify-hover hover:text-spotify-green transition-colors text-left"
                  >
                    <Camera className="w-4 h-4 text-spotify-green" />
                    <span>Change Avatar</span>
                  </button>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-neutral-300 hover:bg-spotify-hover hover:text-spotify-green transition-colors"
                    >
                      <Shield className="w-4 h-4 text-spotify-green" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-spotify-hover transition-colors text-left border-t border-neutral-800/60"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/register"
                className="text-sm font-semibold text-neutral-300 hover:text-white px-4 py-2 transition-colors"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="bg-white text-black text-sm font-bold px-6 py-2 rounded-full hover:scale-105 hover:bg-neutral-100 transition-all shadow-md"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </header>

      <AvatarSelectModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
      />
    </>
  );
};
