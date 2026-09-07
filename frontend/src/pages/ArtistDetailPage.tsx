import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Play, BadgeCheck } from "lucide-react";
import { api } from "../api/client";
import { Artist, Song, Album } from "../types";
import { TrackRow } from "../components/cards/TrackRow";
import { AlbumCard } from "../components/cards/AlbumCard";
import { formatNumber } from "../utils/format";
import { useAuthStore } from "../stores/authStore";
import { usePlayerStore } from "../stores/playerStore";
import { useQueueStore } from "../stores/queueStore";

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const { setCurrentSong, setIsPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtist = () => {
    if (!id) return;
    Promise.all([
      api.get(`/artists/${id}`),
      api.get(`/artists/${id}/songs`),
      api.get(`/artists/${id}/albums`),
    ])
      .then(([aRes, sRes, albRes]) => {
        setArtist(aRes.data.data);
        setSongs(sRes.data.data);
        setAlbums(albRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArtist();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!artist || !isAuthenticated) return;
    try {
      if (artist.isFollowed) {
        await api.delete(`/library/artists/${artist.id}/follow`);
        setArtist({ ...artist, isFollowed: false });
      } else {
        await api.post(`/library/artists/${artist.id}/follow`);
        setArtist({ ...artist, isFollowed: true });
      }
    } catch (e) {}
  };

  const playAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    }
  };

  if (loading || !artist) {
    return <div className="p-8 text-neutral-400">Loading artist...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Cover / Profile Banner */}
      <div
        className="relative h-72 md:h-96 p-6 md:p-10 flex flex-col justify-end bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.9)), url(${
            artist.coverImageUrl || artist.profileImageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200"
          })`,
        }}
      >
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-400">
            <BadgeCheck className="w-5 h-5 fill-current text-sky-400" />
            <span className="text-white">Verified Artist</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight">
            {artist.name}
          </h1>
          <p className="text-sm text-neutral-300 font-medium">
            {formatNumber(artist.monthlyListeners)} monthly listeners
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 md:px-10 flex items-center space-x-4">
        {songs.length > 0 && (
          <button
            onClick={playAll}
            className="w-14 h-14 rounded-full bg-spotify-green text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl transition-all"
            title="Play Artist"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>
        )}
        {isAuthenticated && (
          <button
            onClick={handleFollowToggle}
            className={`px-6 py-2 rounded-full border text-xs font-bold transition-all ${
              artist.isFollowed
                ? "border-spotify-green text-spotify-green bg-spotify-green/10"
                : "border-neutral-500 text-white hover:border-white"
            }`}
          >
            {artist.isFollowed ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* Top Songs */}
      <div className="px-6 md:px-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Popular Songs</h2>
        <div className="bg-neutral-900/40 rounded-xl p-2 divide-y divide-neutral-800/40">
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

      {/* Discography / Albums */}
      {albums.length > 0 && (
        <div className="px-6 md:px-10 space-y-4">
          <h2 className="text-xl font-bold text-white">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      )}

      {/* Biography */}
      {artist.bio && (
        <div className="px-6 md:px-10 space-y-2 max-w-3xl pb-8">
          <h2 className="text-xl font-bold text-white">About</h2>
          <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800">
            {artist.bio}
          </p>
        </div>
      )}
    </div>
  );
};
