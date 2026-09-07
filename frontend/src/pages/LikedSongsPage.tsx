import React, { useEffect, useState } from "react";
import { Heart, Play, Clock } from "lucide-react";
import { api } from "../api/client";
import { Song } from "../types";
import { TrackRow } from "../components/cards/TrackRow";
import { usePlayerStore } from "../stores/playerStore";
import { useQueueStore } from "../stores/queueStore";

export const LikedSongsPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { setCurrentSong, setIsPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();

  const fetchLiked = () => {
    api.get("/library/likes?size=100")
      .then((res) => setSongs(res.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLiked();
  }, []);

  const playAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-gradient-to-b from-indigo-900 to-spotify-black p-6 md:p-10 flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-400 shadow-2xl flex items-center justify-center text-white flex-shrink-0">
          <Heart className="w-20 h-20 fill-white" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">Playlist</span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
            Liked Songs
          </h1>
          <p className="text-sm text-neutral-300">
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 md:px-10">
        {songs.length > 0 && (
          <button
            onClick={playAll}
            className="w-14 h-14 rounded-full bg-spotify-green text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl transition-all"
            title="Play Liked Songs"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* Track List */}
      <div className="px-4 md:px-10">
        {loading ? (
          <div className="py-8 text-neutral-400 text-sm">Loading songs...</div>
        ) : songs.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-neutral-400">
            <p className="text-lg font-bold text-white">Songs you like will appear here</p>
            <p className="text-xs">Save songs by tapping the heart icon on any track.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[32px_1fr_120px_60px] md:grid-cols-[40px_4fr_3fr_1fr_60px] items-center px-4 py-2 border-b border-neutral-800 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <span>#</span>
              <span>Title</span>
              <span className="hidden md:block">Album</span>
              <span className="text-center">Like</span>
              <span className="text-right flex justify-end">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            {songs.map((song, idx) => (
              <TrackRow
                key={song.id}
                index={idx}
                song={song}
                songList={songs}
                onLikedChanged={fetchLiked}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
