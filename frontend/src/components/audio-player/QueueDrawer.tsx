import React from "react";
import { X, Trash2 } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";
import { formatDuration } from "../../utils/format";

export const QueueDrawer: React.FC = () => {
  const { currentSong, isQueueOpen, toggleQueue, setCurrentSong } = usePlayerStore();
  const { queue, currentIndex, removeFromQueue, clearQueue } = useQueueStore();

  if (!isQueueOpen) return null;

  const nextSongs = queue.slice(currentIndex + 1);

  return (
    <div className="fixed right-0 top-16 bottom-20 w-80 sm:w-96 bg-spotify-darkGray/95 backdrop-blur-xl border-l border-neutral-800 z-40 flex flex-col p-4 shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <h3 className="text-base font-bold text-white">Play Queue</h3>
        <div className="flex items-center space-x-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-neutral-400 hover:text-red-400 transition-colors px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={toggleQueue}
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
        {/* Currently Playing */}
        <div>
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Now Playing
          </h4>
          {currentSong ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-spotify-lightGray/80 border border-spotify-green/30">
              <div className="flex items-center space-x-3 truncate">
                <img
                  src={currentSong.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100"}
                  alt={currentSong.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="truncate">
                  <p className="text-sm font-bold text-spotify-green truncate">{currentSong.title}</p>
                  <p className="text-xs text-neutral-400 truncate">{currentSong.artistName}</p>
                </div>
              </div>
              <span className="text-xs text-neutral-400 font-mono pr-2">
                {formatDuration(currentSong.duration)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">No track playing</p>
          )}
        </div>

        {/* Upcoming Tracks in Queue */}
        <div>
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Next Up ({nextSongs.length})
          </h4>
          {nextSongs.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">Queue is empty</p>
          ) : (
            <div className="space-y-1">
              {nextSongs.map((song, idx) => {
                const realIndex = currentIndex + 1 + idx;
                return (
                  <div
                    key={`${song.id}-${realIndex}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-spotify-hover group transition-colors"
                  >
                    <div
                      onClick={() => setCurrentSong(song)}
                      className="flex items-center space-x-3 truncate cursor-pointer flex-1"
                    >
                      <img
                        src={song.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100"}
                        alt={song.title}
                        className="w-9 h-9 rounded object-cover"
                      />
                      <div className="truncate">
                        <p className="text-sm font-semibold text-neutral-200 group-hover:text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">{song.artistName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-neutral-400 font-mono">
                        {formatDuration(song.duration)}
                      </span>
                      <button
                        onClick={() => removeFromQueue(realIndex)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-400 p-1 transition-all"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
