import React, { useState } from "react";
import { X, Music, Upload, Image as ImageIcon } from "lucide-react";
import { api } from "../../api/client";
import { Playlist } from "../../types";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (playlist: Playlist) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a playlist name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 1. Create playlist
      const res = await api.post("/playlists", {
        name: name.trim(),
        description: description.trim(),
        isPublic,
      });
      let createdPlaylist: Playlist = res.data.data;

      // 2. Upload cover if provided
      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        const coverRes = await api.post(`/playlists/${createdPlaylist.id}/cover`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        createdPlaylist = coverRes.data.data;
      }

      onCreated(createdPlaylist);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-spotify-darkGray border border-neutral-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white p-1 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-spotify-green/20 text-spotify-green flex items-center justify-center">
            <Music className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Create New Playlist</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover image picker & preview */}
          <div className="flex items-center space-x-4 pb-1">
            <div className="relative w-24 h-24 rounded-xl bg-neutral-900 border border-neutral-700 overflow-hidden flex items-center justify-center flex-shrink-0 group">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-500">
                  <ImageIcon className="w-7 h-7 mb-1" />
                  <span className="text-[10px]">No Cover</span>
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold">Choose</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Playlist Cover
              </label>
              <p className="text-[11px] text-neutral-400">
                Upload a square cover artwork (.jpg, .png) to give your playlist character.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Playlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Late Night Vibes"
              className="w-full bg-black/60 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a catchy description"
              rows={3}
              className="w-full bg-black/60 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-spotify-green resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded text-spotify-green focus:ring-0 bg-neutral-900 border-neutral-700"
            />
            <label htmlFor="isPublic" className="text-xs text-neutral-300 select-none cursor-pointer">
              Make playlist public
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-spotify-green hover:bg-spotify-greenHover text-black font-bold px-6 py-2 rounded-full text-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
