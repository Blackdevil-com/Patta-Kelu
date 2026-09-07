import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Music } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { api } from "../api/client";
import { Playlist, Artist } from "../types";
import { PlaylistCard } from "../components/cards/PlaylistCard";
import { ArtistCard } from "../components/cards/ArtistCard";
import { CreatePlaylistModal } from "../components/modals/CreatePlaylistModal";

export const LibraryPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tab, setTab] = useState<"playlists" | "artists">("playlists");

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/playlists/me")
        .then((res: any) => setPlaylists(res.data.data.content))
        .catch(() => {});

      api.get("/library/artists")
        .then((res: any) => setArtists(res.data.data.content))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-spotify-green">
          <Music className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Enjoy your Library</h2>
        <p className="text-sm text-neutral-400 max-w-sm">
          Log in to view your favorite playlists, followed artists, and liked songs in one place.
        </p>
        <Link
          to="/login"
          className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform text-sm shadow-md"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setTab("playlists")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              tab === "playlists"
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Playlists
          </button>
          <button
            onClick={() => setTab("artists")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              tab === "artists"
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Artists
          </button>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center space-x-2 bg-spotify-lightGray hover:bg-spotify-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {tab === "playlists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Liked Songs Special Tile */}
          <Link
            to="/liked-songs"
            className="group col-span-2 bg-gradient-to-br from-indigo-800 to-emerald-800 p-6 rounded-2xl flex flex-col justify-between shadow-xl cursor-pointer hover:scale-[1.02] transition-transform min-h-[180px]"
          >
            <Heart className="w-8 h-8 fill-white text-white" />
            <div>
              <h3 className="text-2xl font-extrabold text-white">Liked Songs</h3>
              <p className="text-xs text-white/80 font-medium mt-1">Your auto-collected favorites</p>
            </div>
          </Link>

          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}

      {tab === "artists" && (
        <div>
          {artists.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-400">
              You haven't followed any artists yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}
        </div>
      )}

      <CreatePlaylistModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(newPl: Playlist) => setPlaylists([newPl, ...playlists])}
      />
    </div>
  );
};
