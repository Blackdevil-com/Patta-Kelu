import React, { useState } from "react";
import { Play, Pause, Heart, MoreHorizontal, ListPlus, Trash2 } from "lucide-react";
import { Song } from "../../types";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";
import { useAuthStore } from "../../stores/authStore";
import { formatDuration } from "../../utils/format";
import { api } from "../../api/client";
import { AddToPlaylistModal } from "../modals/AddToPlaylistModal";

interface TrackRowProps {
  index: number;
  song: Song;
  songList: Song[];
  onLikedChanged?: () => void;
  onRemoveFromPlaylist?: () => void;
  canRemove?: boolean;
  onSongDeleted?: () => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  index,
  song,
  songList,
  onLikedChanged,
  onRemoveFromPlaylist,
  canRemove = false,
  onSongDeleted,
}) => {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();
  const { user } = useAuthStore();
  const [showAddToModal, setShowAddToModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  const handleRowClick = () => {
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      setQueue(songList, index);
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (song.isLiked) {
        await api.delete(`/library/likes/${song.id}`);
        song.isLiked = false;
      } else {
        await api.post(`/library/likes/${song.id}`);
        song.isLiked = true;
      }
      if (onLikedChanged) onLikedChanged();
    } catch (e) {}
  };

  const handleAdminDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (!window.confirm(`Permanently delete song "${song.title}" from the platform?`)) return;
    try {
      await api.delete(`/admin/songs/${song.id}`);
      if (onSongDeleted) onSongDeleted();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete song");
    }
  };

  return (
    <>
      <div
        onClick={handleRowClick}
        className="group relative grid grid-cols-[32px_1fr_60px_60px] md:grid-cols-[40px_4fr_3fr_1fr_90px] items-center px-4 py-2.5 rounded-lg hover:bg-spotify-hover/60 transition-colors cursor-pointer text-sm text-neutral-400 select-none"
      >
        {/* 1. Track Index or Play Icon */}
        <div className="flex items-center justify-center font-mono text-xs">
          <span className="group-hover:hidden">
            {isCurrent ? <span className="text-spotify-green font-bold">?</span> : index + 1}
          </span>
          <button className="hidden group-hover:block text-white hover:scale-110 transition-transform">
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>
        </div>

        {/* 2. Title & Artist */}
        <div className="flex items-center space-x-3 truncate pr-4">
          <img
            src={song.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100"}
            alt={song.title}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
          <div className="truncate">
            <p className={`font-semibold truncate ${isCurrent ? "text-spotify-green" : "text-white"}`}>
              {song.title}
            </p>
            <p className="text-xs text-neutral-400 truncate">{song.artistName}</p>
          </div>
        </div>

        {/* 3. Album Title (Desktop) */}
        <div className="hidden md:block truncate text-xs text-neutral-400 pr-4">
          {song.albumTitle || "Single"}
        </div>

        {/* 4. Like Action */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleLike}
            className={`p-1 transition-transform active:scale-125 ${
              song.isLiked ? "text-spotify-green" : "text-neutral-500 hover:text-white"
            }`}
            title={song.isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          >
            <Heart className={`w-4 h-4 ${song.isLiked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* 5. Duration & Context Menu */}
        <div className="flex items-center justify-end space-x-2 text-right font-mono text-xs text-neutral-400">
          <span>{formatDuration(song.duration)}</span>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:text-white text-neutral-500 transition-colors"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-1 z-30 text-left font-sans text-xs"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowAddToModal(true);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <ListPlus className="w-4 h-4 text-spotify-green" />
                  <span>Add to Playlist</span>
                </button>

                {canRemove && onRemoveFromPlaylist && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onRemoveFromPlaylist();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-neutral-300 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove from this playlist</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={handleAdminDelete}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-red-400 hover:bg-red-950/40 border-t border-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Delete from Platform</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddToPlaylistModal
        song={song}
        isOpen={showAddToModal}
        onClose={() => setShowAddToModal(false)}
      />
    </>
  );
};
