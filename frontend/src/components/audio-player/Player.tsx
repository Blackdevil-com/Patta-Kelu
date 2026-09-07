import React from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, ListMusic, Heart, Loader2 } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { formatDuration } from "../../utils/format";
import { api } from "../../api/client";

export const Player: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    playbackState,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isQueueOpen,
    toggleShuffle,
    toggleRepeat,
    toggleMute,
    setVolume,
    toggleQueue,
    setCurrentSong,
  } = usePlayerStore();

  const { seek, playNext, playPrev, togglePlay } = useAudioPlayer();

  const handleLikeToggle = async () => {
    if (!currentSong) return;
    try {
      if (currentSong.isLiked) {
        await api.delete(`/library/likes/${currentSong.id}`);
        setCurrentSong({ ...currentSong, isLiked: false });
      } else {
        await api.post(`/library/likes/${currentSong.id}`);
        setCurrentSong({ ...currentSong, isLiked: true });
      }
    } catch (e) {}
  };

  if (!currentSong) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-spotify-black/95 backdrop-blur-xl border-t border-neutral-800/80 px-4 md:px-6 flex items-center justify-between z-50 select-none">
      {/* 1. Track Info (Left) */}
      <div className="flex items-center space-x-3 w-1/4 min-w-[180px]">
        <img
          src={currentSong.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100"}
          alt={currentSong.title}
          className="w-12 h-12 rounded object-cover shadow-md"
        />
        <div className="truncate pr-2">
          <p className="text-sm font-bold truncate hover:underline cursor-pointer text-white">
            {currentSong.title}
          </p>
          <p className="text-xs text-spotify-textMuted truncate hover:underline cursor-pointer">
            {currentSong.artistName}
          </p>
        </div>
        <button
          onClick={handleLikeToggle}
          className={`p-1 transition-transform active:scale-125 ${
            currentSong.isLiked ? "text-spotify-green" : "text-neutral-400 hover:text-white"
          }`}
        >
          <Heart className={`w-5 h-5 ${currentSong.isLiked ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* 2. Playback Controls & Seek Bar (Center) */}
      <div className="flex flex-col items-center max-w-xl w-2/4 px-4">
        <div className="flex items-center space-x-5 mb-1.5">
          <button
            onClick={toggleShuffle}
            className={`p-1 transition-colors ${
              isShuffle ? "text-spotify-green" : "text-neutral-400 hover:text-white"
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={playPrev}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
            title={isPlaying ? "Pause" : "Play"}
          >
            {playbackState === "LOADING" || playbackState === "BUFFERING" ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1 transition-colors relative ${
              repeatMode !== "OFF" ? "text-spotify-green" : "text-neutral-400 hover:text-white"
            }`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === "ONE" && (
              <span className="absolute -top-1 -right-1 text-[9px] font-extrabold text-spotify-green">1</span>
            )}
          </button>
        </div>

        {/* Seek Bar */}
        <div className="w-full flex items-center space-x-2 text-xs text-neutral-400 font-mono">
          <span>{formatDuration(currentTime)}</span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white group-hover:accent-spotify-green transition-all"
            />
          </div>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* 3. Volume & Queue Toggle (Right) */}
      <div className="flex items-center justify-end space-x-3 w-1/4">
        <button
          onClick={toggleQueue}
          className={`p-1.5 rounded transition-colors ${
            isQueueOpen ? "text-spotify-green" : "text-neutral-400 hover:text-white"
          }`}
          title="Play Queue"
        >
          <ListMusic className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 w-28 hidden sm:flex">
          <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition-colors">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-spotify-green transition-all"
          />
        </div>
      </div>
    </footer>
  );
};
