import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { api } from "../api/client";
import { Album, Song } from "../types";
import { TrackRow } from "../components/cards/TrackRow";
import { usePlayerStore } from "../stores/playerStore";
import { useQueueStore } from "../stores/queueStore";

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setCurrentSong, setIsPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();

  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/albums/${id}`),
      api.get(`/albums/${id}/songs`),
    ])
      .then(([aRes, sRes]) => {
        setAlbum(aRes.data.data);
        setSongs(sRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const playAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    }
  };

  if (loading || !album) {
    return <div className="p-8 text-neutral-400">Loading album...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-b from-neutral-800 to-spotify-black p-6 md:p-10 flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-neutral-900 shadow-2xl overflow-hidden flex-shrink-0">
          <img
            src={album.coverImageUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500"}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">{album.albumType}</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{album.title}</h1>
          <div className="flex items-center space-x-2 text-xs text-neutral-300 pt-1">
            <Link to={`/artist/${album.artistId}`} className="font-bold text-white hover:underline">
              {album.artistName}
            </Link>
            <span>•</span>
            <span>{album.releaseDate ? new Date(album.releaseDate).getFullYear() : ""}</span>
            <span>•</span>
            <span>{songs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 md:px-10">
        {songs.length > 0 && (
          <button
            onClick={playAll}
            className="w-14 h-14 rounded-full bg-spotify-green text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl transition-all"
            title="Play Album"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* Track List */}
      <div className="px-4 md:px-10">
        <div className="space-y-1">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};
