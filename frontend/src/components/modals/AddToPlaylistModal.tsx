import React, { useEffect, useState } from "react";
import { X, Plus, Check, Music } from "lucide-react";
import { api } from "../../api/client";
import { Playlist, Song } from "../../types";

interface AddToPlaylistModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSongAdded?: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  song,
  isOpen,
  onClose,
  onSongAdded,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && song) {
      setLoading(true);
      setError("");
      setAddedPlaylists(new Set());
      api
        .get("/playlists/me?size=50")
        .then((res) => {
          setPlaylists(res.data?.data?.content || []);
        })
        .catch(() => {
          setError("Failed to load your playlists. Please make sure you are logged in.");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, song]);

  if (!isOpen || !song) return null;

  const handleAdd = async (playlistId: string) => {
    try {
      await api.post(`/playlists/${playlistId}/songs`, { songId: song.id });
      setAddedPlaylists((prev) => new Set(prev).add(playlistId));
      if (onSongAdded) onSongAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add song to playlist");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <img
              src={song.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100"}
              alt={song.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="truncate">
              <h3 className="text-sm font-bold text-white truncate">{song.title}</h3>
              <p className="text-xs text-neutral-400 truncate">{song.artistName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Add to playlist
        </h4>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-900">
            {error}
          </p>
        )}

        <div className="max-h-60 overflow-y-auto divide-y divide-neutral-800 space-y-1">
          {loading ? (
            <div className="py-6 text-center text-xs text-neutral-400">Loading playlists...</div>
          ) : playlists.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400">
              You haven't created any playlists yet.
            </div>
          ) : (
            playlists.map((pl) => {
              const isAdded = addedPlaylists.has(pl.id);
              return (
                <div
                  key={pl.id}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-neutral-800/60 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-9 h-9 rounded-md bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-400">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{pl.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {pl.isPublic ? "Public" : "Private"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdd(pl.id)}
                    disabled={isAdded}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isAdded
                        ? "bg-spotify-green/20 text-spotify-green cursor-default"
                        : "bg-white text-black hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
