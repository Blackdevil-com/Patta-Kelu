import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Trash2, Clock, Music, Search, Plus, Camera } from "lucide-react";
import { api } from "../api/client";
import { Playlist, Song } from "../types";
import { TrackRow } from "../components/cards/TrackRow";
import { useAuthStore } from "../stores/authStore";
import { usePlayerStore } from "../stores/playerStore";
import { useQueueStore } from "../stores/queueStore";

export const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setCurrentSong, setIsPlaying } = usePlayerStore();
  const { setQueue } = useQueueStore();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // In-playlist search & add songs
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchPlaylist = () => {
    if (!id) return;
    api.get(`/playlists/${id}`)
      .then((res) => setPlaylist(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load playlist"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const isOwner = Boolean(user && playlist && user.id === playlist.ownerId);

  const handleDelete = async () => {
    if (!playlist || !window.confirm("Are you sure you want to delete this playlist?")) return;
    try {
      await api.delete(`/playlists/${playlist.id}`);
      navigate("/library");
    } catch (e) {}
  };

  const playAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      setQueue(playlist.tracks, 0);
      setCurrentSong(playlist.tracks[0]);
      setIsPlaying(true);
    }
  };

  const handleRemoveTrack = async (songId: string) => {
    if (!playlist) return;
    try {
      await api.delete(`/playlists/${playlist.id}/songs/${songId}`);
      fetchPlaylist();
    } catch (e) {}
  };

  const handleAddTrack = async (songId: string) => {
    if (!playlist) return;
    try {
      await api.post(`/playlists/${playlist.id}/songs`, { songId });
      fetchPlaylist();
    } catch (e) {}
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !playlist) return;
    const formData = new FormData();
    formData.append("cover", file);
    try {
      const res = await api.post(`/playlists/${playlist.id}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPlaylist(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload playlist cover");
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data?.data?.songs || []);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-400">Loading playlist...</div>;
  }

  if (error || !playlist) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Playlist not found</h2>
        <p className="text-sm text-neutral-400">{error}</p>
      </div>
    );
  }

  const tracks = playlist.tracks || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-b from-neutral-800 to-spotify-black p-6 md:p-10 flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-neutral-900 shadow-2xl overflow-hidden flex-shrink-0 group">
          {playlist.coverImageUrl ? (
            <img src={playlist.coverImageUrl} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-900">
              <Music className="w-20 h-20" />
            </div>
          )}

          {isOwner && (
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs font-bold">Change Cover</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCover}
                className="hidden"
              />
            </label>
          )}
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            {playlist.isPublic ? "Public Playlist" : "Private Playlist"}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{playlist.name}</h1>
          <p className="text-xs text-neutral-400 max-w-lg">{playlist.description || "No description provided."}</p>
          <div className="flex items-center space-x-2 text-xs text-neutral-300 pt-1">
            <span className="font-bold text-white">{playlist.ownerName}</span>
            <span>ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢</span>
            <span>{tracks.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 md:px-10 flex items-center space-x-4">
        {tracks.length > 0 && (
          <button
            onClick={playAll}
            className="w-14 h-14 rounded-full bg-spotify-green text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl transition-all"
            title="Play Playlist"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>
        )}
        {isOwner && (
          <button
            onClick={handleDelete}
            className="text-neutral-400 hover:text-red-400 p-2 transition-colors"
            title="Delete Playlist"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Track List */}
      <div className="px-4 md:px-10">
        {tracks.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-400">
            This playlist currently has no songs. Use the search below to find and add tracks!
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[32px_1fr_60px_60px] md:grid-cols-[40px_4fr_3fr_1fr_90px] items-center px-4 py-2 border-b border-neutral-800 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <span>#</span>
              <span>Title</span>
              <span className="hidden md:block">Album</span>
              <span className="text-center">Like</span>
              <span className="text-right flex justify-end">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            {tracks.map((song, idx) => (
              <TrackRow
                key={song.id}
                index={idx}
                song={song}
                songList={tracks}
                canRemove={isOwner}
                onRemoveFromPlaylist={() => handleRemoveTrack(song.id)}
                onSongDeleted={fetchPlaylist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommended / Search Section for Playlist Owners */}
      {isOwner && (
        <div className="px-4 md:px-10 pt-10 border-t border-neutral-900 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Let's find something for your playlist</h3>
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for songs to add..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          {searching && <p className="text-xs text-neutral-400">Searching catalog...</p>}

          {searchResults.length > 0 && (
            <div className="divide-y divide-neutral-800/60 max-w-3xl">
              {searchResults.map((song) => {
                const alreadyInPlaylist = tracks.some((t) => t.id === song.id);
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between py-2.5 px-3 hover:bg-neutral-800/40 rounded-xl transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <img
                        src={song.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100"}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                        <p className="text-xs text-neutral-400 truncate">{song.artistName}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddTrack(song.id)}
                      disabled={alreadyInPlaylist}
                      className={`flex items-center space-x-1 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        alreadyInPlaylist
                          ? "border border-neutral-700 text-neutral-500 cursor-default"
                          : "border border-neutral-400 text-white hover:border-white hover:scale-105"
                      }`}
                    >
                      {alreadyInPlaylist ? (
                        <span>Added</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
