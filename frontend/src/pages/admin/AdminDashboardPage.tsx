import React, { useEffect, useState } from "react";
import { Users, Music, Disc, Radio, Shield, Upload, PlayCircle, Trash2, Search } from "lucide-react";
import { api } from "../../api/client";
import { formatNumber, formatDuration } from "../../utils/format";
import { Song } from "../../types";

interface Stats {
  totalUsers: number;
  totalArtists: number;
  totalAlbums: number;
  totalSongs: number;
  totalPlaylists: number;
  totalPlays: number;
}

interface UserItem {
  id: string;
  email: string;
  username: string;
  displayName: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
}

interface AuditLogItem {
  id: number;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  details: string;
  createdAt: string;
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "songs" | "users" | "upload" | "audit">("overview");

  // Upload Form State
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [genreName, setGenreName] = useState("Pop");
  const [duration, setDuration] = useState(210);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");

  const fetchData = () => {
    api.get("/admin/stats").then((res) => setStats(res.data.data)).catch(() => {});
    api.get("/admin/users?size=50").then((res) => setUsers(res.data.data.content)).catch(() => {});
    api.get("/admin/audit-logs?size=50").then((res) => setAuditLogs(res.data.data.content)).catch(() => {});
    api.get("/songs?size=50").then((res) => setSongs(res.data.data.content)).catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { enabled: !currentStatus });
      setUsers(users.map((u) => (u.id === userId ? { ...u, enabled: !currentStatus } : u)));
    } catch (e) {}
  };

  const handleDeleteSong = async (song: Song) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${song.title}" by ${song.artistName} from the platform?`)) {
      return;
    }
    try {
      await api.delete(`/admin/songs/${song.id}`);
      setSongs(songs.filter((s) => s.id !== song.id));
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete song");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadSuccess("");
    setUploadError("");

    const formData = new FormData();
    formData.append("title", songTitle);
    formData.append("artistName", artistName);
    if (albumTitle) formData.append("albumTitle", albumTitle);
    if (genreName) formData.append("genreName", genreName);
    formData.append("duration", duration.toString());
    if (audioFile) formData.append("audioFile", audioFile);
    if (coverFile) formData.append("coverImageFile", coverFile);

    try {
      await api.post("/admin/songs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadSuccess(`Song "${songTitle}" registered and uploaded successfully!`);
      setSongTitle("");
      setArtistName("");
      setAlbumTitle("");
      setAudioFile(null);
      setCoverFile(null);
      fetchData();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || "Failed to upload song");
    } finally {
      setUploading(false);
    }
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(songSearchQuery.toLowerCase()) ||
      s.artistName.toLowerCase().includes(songSearchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-spotify-green">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Administration Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Platform Operations</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          {(["overview", "songs", "users", "upload", "audit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                activeTab === tab
                  ? "bg-spotify-green text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab === "songs" ? "Manage Songs" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-spotify-darkGray p-5 rounded-2xl border border-neutral-800 space-y-1">
              <Users className="w-5 h-5 text-indigo-400" />
              <p className="text-2xl font-black text-white">{formatNumber(stats.totalUsers)}</p>
              <p className="text-xs text-neutral-400">Total Users</p>
            </div>
            <div className="bg-spotify-darkGray p-5 rounded-2xl border border-neutral-800 space-y-1">
              <Radio className="w-5 h-5 text-spotify-green" />
              <p className="text-2xl font-black text-white">{formatNumber(stats.totalArtists)}</p>
              <p className="text-xs text-neutral-400">Total Artists</p>
            </div>
            <div className="bg-spotify-darkGray p-5 rounded-2xl border border-neutral-800 space-y-1">
              <Disc className="w-5 h-5 text-sky-400" />
              <p className="text-2xl font-black text-white">{formatNumber(stats.totalAlbums)}</p>
              <p className="text-xs text-neutral-400">Total Albums</p>
            </div>
            <div className="bg-spotify-darkGray p-5 rounded-2xl border border-neutral-800 space-y-1">
              <Music className="w-5 h-5 text-amber-400" />
              <p className="text-2xl font-black text-white">{formatNumber(stats.totalSongs)}</p>
              <p className="text-xs text-neutral-400">Total Tracks</p>
            </div>
            <div className="bg-spotify-darkGray p-5 rounded-2xl border border-neutral-800 space-y-1">
              <Disc className="w-5 h-5 text-purple-400" />
              <p className="text-2xl font-black text-white">{formatNumber(stats.totalPlaylists)}</p>
              <p className="text-xs text-neutral-400">Playlists</p>
            </div>
            <div className="bg-spotify-darkGray p-5 rounded-2xl border border-neutral-800 space-y-1">
              <PlayCircle className="w-5 h-5 text-rose-400" />
              <p className="text-2xl font-black text-white">{formatNumber(stats.totalPlays)}</p>
              <p className="text-xs text-neutral-400">Global Streams</p>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE SONGS TAB */}
      {activeTab === "songs" && (
        <div className="bg-spotify-darkGray rounded-2xl border border-neutral-800 overflow-hidden shadow-xl space-y-4">
          <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-white">Catalog Song Management</h3>
              <p className="text-xs text-neutral-400">Inspect, monitor, and remove songs from the platform</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={songSearchQuery}
                onChange={(e) => setSongSearchQuery(e.target.value)}
                placeholder="Search songs or artists..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green"
              />
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-black/50 text-xs uppercase text-neutral-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Track</th>
                  <th className="py-3 px-4">Artist</th>
                  <th className="py-3 px-4">Album</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Streams</th>
                  <th className="py-3 px-4 text-right">Authority Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={song.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100"}
                          alt={song.title}
                          className="w-9 h-9 rounded object-cover flex-shrink-0"
                        />
                        <span className="font-semibold text-white truncate max-w-xs">{song.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{song.artistName}</td>
                    <td className="py-3 px-4 text-neutral-400 text-xs">{song.albumTitle || "Single"}</td>
                    <td className="py-3 px-4 font-mono text-xs">{formatDuration(song.duration)}</td>
                    <td className="py-3 px-4 font-mono text-xs">{formatNumber(song.playCount || 0)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteSong(song)}
                        className="inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 transition-colors"
                        title="Permanently delete song"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSongs.length === 0 && (
              <div className="py-12 text-center text-xs text-neutral-400">
                No songs match the current search query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="bg-spotify-darkGray rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Registered Users Moderation</h3>
            <span className="text-xs text-neutral-400">{users.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-black/50 text-xs uppercase text-neutral-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Roles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-white">{u.displayName}</p>
                        <p className="text-xs text-neutral-500">@{u.username}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">{u.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r === "ROLE_ADMIN"
                                ? "bg-spotify-green/20 text-spotify-green"
                                : "bg-neutral-800 text-neutral-300"
                            }`}
                          >
                            {r.replace("ROLE_", "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.enabled
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {u.enabled ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id, u.enabled)}
                        className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${
                          u.enabled
                            ? "bg-red-950/60 hover:bg-red-900 text-red-300"
                            : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300"
                        }`}
                      >
                        {u.enabled ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPLOAD SONG TAB */}
      {activeTab === "upload" && (
        <div className="max-w-2xl bg-spotify-darkGray border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Upload & Register Song</h3>
            <p className="text-xs text-neutral-400">Add high-fidelity music to the Patta Kelu catalog</p>
          </div>

          {uploadSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300">
              {uploadSuccess}
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
              {uploadError}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Track Title *
                </label>
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="e.g. Midnight City"
                  className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Artist Name *
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="e.g. M83"
                  className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Album Name
                </label>
                <input
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="e.g. Hurry Up, We're Dreaming"
                  className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Genre
                </label>
                <select
                  value={genreName}
                  onChange={(e) => setGenreName(e.target.value)}
                  className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green"
                >
                  <option value="pop">Pop</option>
                  <option value="hip-hop">Hip Hop</option>
                  <option value="rock">Rock</option>
                  <option value="electronic">Electronic</option>
                  <option value="r-and-b">R&B</option>
                  <option value="indie">Indie</option>
                  <option value="classical">Classical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Duration (secs)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-black/60 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-spotify-green"
                  min={10}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Audio Binary File (.mp3, .wav)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAudioFile(file);
                    if (file) {
                      const audio = new Audio();
                      audio.src = URL.createObjectURL(file);
                      audio.onloadedmetadata = () => {
                        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
                          setDuration(Math.round(audio.duration));
                        }
                      };
                    }
                  }}
                  className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Cover Artwork (.jpg, .png)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold px-8 py-3 rounded-full text-sm shadow-xl transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? "Uploading Track..." : "Register Song"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === "audit" && (
        <div className="bg-spotify-darkGray rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-bold text-base text-white">Security & Operation Audit Trail</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-black/50 text-xs uppercase text-neutral-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono text-xs">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-bold text-spotify-green">{log.action}</td>
                    <td className="py-3 px-4">{log.resourceType}:{log.resourceId}</td>
                    <td className="py-3 px-4 text-neutral-400">{log.ipAddress || "127.0.0.1"}</td>
                    <td className="py-3 px-4 text-neutral-400 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
