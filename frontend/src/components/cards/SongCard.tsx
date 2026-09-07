import React, { useState } from "react";
import { Play, Pause, ListPlus } from "lucide-react";
import { Song } from "../../types";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";
import { AddToPlaylistModal } from "../modals/AddToPlaylistModal";

interface SongCardProps {
  song: Song;
  songList?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({ song, songList }) => {
  const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = usePlayerStore();
  const { setQueue } = useQueueStore();
  const [showAddToModal, setShowAddToModal] = useState(false);

  const isCurrent = currentSong?.id === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      if (songList && songList.length > 0) {
        const idx = songList.findIndex((s) => s.id === song.id);
        setQueue(songList, idx >= 0 ? idx : 0);
      }
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <>
      <div
        onClick={handlePlayClick}
        className="group relative bg-spotify-darkGray/60 hover:bg-spotify-lightGray p-4 rounded-xl transition-all duration-300 hover:shadow-2xl cursor-pointer flex flex-col justify-between"
      >
        <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-lg shadow-md bg-neutral-900">
          <img
            src={song.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300"}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Add to playlist quick button on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddToModal(true);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
            title="Add to Playlist"
          >
            <ListPlus className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayClick}
            className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-xl transition-all duration-300 ${
              isCurrent && isPlaying
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 hover:scale-110"
            }`}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        <div>
          <h4 className={`font-bold text-sm truncate ${isCurrent ? "text-spotify-green" : "text-white"}`}>
            {song.title}
          </h4>
          <p className="text-xs text-spotify-textMuted truncate mt-1">{song.artistName}</p>
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
