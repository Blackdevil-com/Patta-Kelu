import React, { useState, useEffect } from "react";
import { Search, Music2, X } from "lucide-react";
import { api } from "../api/client";
import { SearchResults, Genre } from "../types";
import { TrackRow } from "../components/cards/TrackRow";
import { ArtistCard } from "../components/cards/ArtistCard";
import { AlbumCard } from "../components/cards/AlbumCard";
import { PlaylistCard } from "../components/cards/PlaylistCard";

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/genres")
      .then((res) => setGenres(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      api.get(`/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => setResults(res.data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-neutral-800/90 hover:bg-neutral-800 focus:bg-neutral-800 border border-transparent focus:border-neutral-600 rounded-full pl-12 pr-10 py-3.5 text-sm text-white placeholder-neutral-400 focus:outline-none transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results View */}
      {query.trim() ? (
        loading ? (
          <div className="py-12 flex justify-center text-neutral-400 text-sm">
            Searching songs, artists, albums...
          </div>
        ) : results ? (
          <div className="space-y-10">
            {/* Top Song Matches */}
            {results.songs.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xl font-bold text-white">Songs</h3>
                <div className="bg-neutral-900/40 rounded-xl p-2 divide-y divide-neutral-800/40">
                  {results.songs.map((song, idx) => (
                    <TrackRow
                      key={song.id}
                      index={idx}
                      song={song}
                      songList={results.songs}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Artist Matches */}
            {results.artists.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xl font-bold text-white">Artists</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results.artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {/* Album Matches */}
            {results.albums.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xl font-bold text-white">Albums</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </div>
              </section>
            )}

            {/* Playlist Matches */}
            {results.playlists.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-xl font-bold text-white">Playlists</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}

            {results.songs.length === 0 &&
              results.artists.length === 0 &&
              results.albums.length === 0 &&
              results.playlists.length === 0 && (
                <div className="text-center py-16 space-y-2 text-neutral-400">
                  <p className="text-lg font-bold text-white">No results found for "{query}"</p>
                  <p className="text-xs">Please make sure your words are spelled correctly or try different keywords.</p>
                </div>
              )}
          </div>
        ) : null
      ) : (
        /* Browse All Genres */
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Browse All</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {genres.map((g) => (
              <div
                key={g.id}
                onClick={() => setQuery(g.name)}
                className="relative h-36 rounded-xl p-4 font-bold text-lg md:text-xl text-white overflow-hidden shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform flex flex-col justify-between"
                style={{ backgroundColor: g.colorCode || "#2E77D0" }}
              >
                <span>{g.name}</span>
                <Music2 className="w-16 h-16 opacity-30 absolute -right-2 -bottom-2 rotate-12" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
