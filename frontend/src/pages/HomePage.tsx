import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { HomeFeed } from "../types";
import { SongCard } from "../components/cards/SongCard";
import { ArtistCard } from "../components/cards/ArtistCard";
import { AlbumCard } from "../components/cards/AlbumCard";
import { PlaylistCard } from "../components/cards/PlaylistCard";
import { Link } from "react-router-dom";
import { Play, Sparkles, Music, UploadCloud, Plus } from "lucide-react";
import { usePlayerStore } from "../stores/playerStore";
import { useQueueStore } from "../stores/queueStore";
import { useAuthStore } from "../stores/authStore";

export const HomePage: React.FC = () => {
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(true);

  const { setCurrentSong, setIsPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  useEffect(() => {
    api.get("/discover/home")
      .then((res) => setFeed(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hasTrending = !!(feed?.trendingSongs && feed.trendingSongs.length > 0);
  const hasContent = hasTrending ||
    !!(feed?.newReleases && feed.newReleases.length > 0) ||
    !!(feed?.topArtists && feed.topArtists.length > 0) ||
    !!(feed?.popularAlbums && feed.popularAlbums.length > 0) ||
    !!(feed?.featuredPlaylists && feed.featuredPlaylists.length > 0);

  const playAllTrending = () => {
    if (feed?.trendingSongs && feed.trendingSongs.length > 0) {
      setQueue(feed.trendingSongs, 0);
      setCurrentSong(feed.trendingSongs[0]);
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-64 bg-neutral-900 rounded-3xl" />
        <div className="h-8 bg-neutral-900 w-48 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-neutral-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-10">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-neutral-900 to-black p-8 md:p-12 border border-emerald-500/20 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-spotify-green/20 text-spotify-green text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Audio Experience</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Feel the Rhythm with <span className="text-spotify-green">Patta Kelu</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
            Stream high-fidelity music, curated playlists, and chart-topping releases from visionary artists across the globe.
          </p>
          <div className="pt-2">
            {hasTrending ? (
              <button
                onClick={playAllTrending}
                className="inline-flex items-center space-x-2 bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold px-8 py-3.5 rounded-full text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Trending Now</span>
              </button>
            ) : isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center space-x-2 bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold px-8 py-3.5 rounded-full text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <UploadCloud className="w-5 h-5" />
                <span>Upload Music in Admin</span>
              </Link>
            ) : (
              <Link
                to="/library"
                className="inline-flex items-center space-x-2 bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold px-8 py-3.5 rounded-full text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Create Playlist</span>
              </Link>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-spotify-green/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Trending Songs */}
      {feed?.trendingSongs && feed.trendingSongs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Trending Hits</h2>
              <p className="text-xs text-spotify-textMuted">Most streamed tracks worldwide</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {feed.trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} songList={feed.trendingSongs} />
            ))}
          </div>
        </section>
      )}

      {/* New Releases */}
      {feed?.newReleases && feed.newReleases.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">New Releases</h2>
              <p className="text-xs text-spotify-textMuted">Freshly dropped songs and singles</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {feed.newReleases.map((song) => (
              <SongCard key={song.id} song={song} songList={feed.newReleases} />
            ))}
          </div>
        </section>
      )}

      {/* Top Artists */}
      {feed?.topArtists && feed.topArtists.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Popular Artists</h2>
            <p className="text-xs text-spotify-textMuted">Top creators topping the charts</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {feed.topArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Albums */}
      {feed?.popularAlbums && feed.popularAlbums.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Featured Albums</h2>
            <p className="text-xs text-spotify-textMuted">Complete musical journeys</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {feed.popularAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Playlists */}
      {feed?.featuredPlaylists && feed.featuredPlaylists.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">Curated Playlists</h2>
            <p className="text-xs text-spotify-textMuted">Crafted for every mood and moment</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {feed.featuredPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

      {/* Clean Library Empty State */}
      {!hasContent && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl bg-neutral-900/40 border border-neutral-800/60 space-y-4">
          <div className="w-16 h-16 rounded-full bg-spotify-green/10 flex items-center justify-center text-spotify-green shadow-inner">
            <Music className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-xl font-extrabold text-white">Your Clean Music Library Awaits</h3>
            <p className="text-sm text-spotify-textMuted leading-relaxed">
              No default songs or clutter. Share your platform with your friends, start uploading your favorite tracks, and build your own playlists!
            </p>
          </div>
          <div className="pt-2">
            {isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center space-x-2 bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold px-6 py-3 rounded-full text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Go to Admin & Upload Songs</span>
              </Link>
            ) : (
              <Link
                to="/library"
                className="inline-flex items-center space-x-2 bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold px-6 py-3 rounded-full text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Playlist</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
