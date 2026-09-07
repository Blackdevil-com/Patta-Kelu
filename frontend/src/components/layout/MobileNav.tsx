import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Library, Heart } from "lucide-react";

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const items = [
    { label: "Home", path: "/", icon: Home },
    { label: "Search", path: "/search", icon: Search },
    { label: "Library", path: "/library", icon: Library },
    { label: "Liked", path: "/liked-songs", icon: Heart },
  ];

  return (
    <nav className="md:hidden fixed bottom-20 left-0 right-0 h-14 bg-black/95 backdrop-blur-lg border-t border-neutral-800 flex items-center justify-around z-40 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 ${
              isActive ? "text-spotify-green" : "text-neutral-400"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
