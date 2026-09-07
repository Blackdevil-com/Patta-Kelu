import React, { useState, useRef } from "react";
import { X, Upload, Check, Crop, RefreshCw } from "lucide-react";
import { api } from "../../api/client";
import { useAuthStore } from "../../stores/authStore";

interface AvatarSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 7 Diverse, aesthetic pre-made avatars
const DEFAULT_AVATARS = [
  { id: "1", name: "Neon Beats", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop" },
  { id: "2", name: "Retro Vinyl", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
  { id: "3", name: "Synth Wave", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
  { id: "4", name: "Cyber Punk", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" },
  { id: "5", name: "Lo-Fi Glow", url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" },
  { id: "6", name: "Sonic Wave", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" },
  { id: "7", name: "Midnight DJ", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop" },
];

export const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [selectedPreset, setSelectedPreset] = useState<string>(user?.profileImageUrl || DEFAULT_AVATARS[0].url);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [cropPreview, setCropPreview] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const imageRef = useRef<HTMLImageElement | null>(null);

  if (!isOpen || !user) return null;

  const handleSelectPreset = async (url: string) => {
    setSelectedPreset(url);
    setIsCropping(false);
    setCustomFile(null);
    setCropPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCropPreview(objectUrl);
    setIsCropping(true);
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
  };

  // Perform client-side 1:1 square crop to canvas and create Blob
  const createCroppedBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imageRef.current) return reject("No image loaded");
      const img = imageRef.current;
      const canvas = document.createElement("canvas");
      const size = 300; // standard 1:1 avatar resolution
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No 2D context");

      // Fill canvas background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, size, size);

      // Determine center crop
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - minDim) / 2 + (cropX * minDim) / 100;
      const sy = (img.naturalHeight - minDim) / 2 + (cropY * minDim) / 100;
      const sWidth = minDim / cropZoom;
      const sHeight = minDim / cropZoom;

      ctx.drawImage(img, Math.max(0, sx), Math.max(0, sy), sWidth, sHeight, 0, 0, size, size);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject("Failed to generate blob");
      }, "image/jpeg", 0.95);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      if (isCropping && customFile) {
        // Upload cropped custom avatar
        const croppedBlob = await createCroppedBlob();
        const formData = new FormData();
        formData.append("avatar", croppedBlob, "avatar.jpg");

        const res = await api.post("/users/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const updatedUser = res.data.data;
        useAuthStore.setState({ user: updatedUser });
      } else {
        // Save selected preset URL
        const res = await api.put("/users/me", {
          profileImageUrl: selectedPreset,
        });
        const updatedUser = res.data.data;
        useAuthStore.setState({ user: updatedUser });
      }

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-spotify-darkGray border border-neutral-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white">Choose Profile Avatar</h3>
            <p className="text-xs text-neutral-400">Pick from our 7 custom styles or upload & crop your own 1:1 image</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        {/* 1. Custom Upload & 1:1 Crop Mode */}
        {isCropping && cropPreview ? (
          <div className="space-y-4 bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-spotify-green text-xs font-bold uppercase tracking-wider">
                <Crop className="w-4 h-4" />
                <span>Crop 1:1 Square Avatar</span>
              </div>
              <button
                onClick={() => setIsCropping(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Back to Presets
              </button>
            </div>

            <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-2 border-spotify-green shadow-2xl bg-black flex items-center justify-center">
              <img
                ref={imageRef}
                src={cropPreview}
                alt="Crop preview"
                className="max-w-none transition-transform"
                style={{
                  transform: `scale(${cropZoom}) translate(${cropX}px, ${cropY}px)`,
                  maxHeight: "100%",
                }}
              />
            </div>

            {/* Crop & Zoom Slider */}
            <div className="space-y-2 max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Zoom</span>
                <span>{cropZoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-full accent-spotify-green cursor-pointer"
              />
            </div>
          </div>
        ) : (
          /* 2. Seven Pre-made Avatars */
          <div className="space-y-3">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Default Avatars (7 Options)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {DEFAULT_AVATARS.map((avatar) => {
                const isSelected = selectedPreset === avatar.url && !isCropping;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => handleSelectPreset(avatar.url)}
                    className={`group relative aspect-square rounded-full overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-spotify-green scale-105 shadow-lg shadow-spotify-green/30"
                        : "border-transparent hover:border-neutral-500 opacity-80 hover:opacity-100"
                    }`}
                    title={avatar.name}
                  >
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-spotify-green/20 flex items-center justify-center text-spotify-green">
                        <Check className="w-5 h-5 drop-shadow-md stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Upload Custom Image Action */}
        {!isCropping && (
          <div className="pt-2 border-t border-neutral-800">
            <label className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-spotify-green hover:bg-spotify-green/5 text-neutral-300 hover:text-white transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-spotify-green" />
              <span className="text-xs font-bold">Upload Custom Image (with 1:1 Cropper)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-spotify-green hover:bg-spotify-greenHover text-black font-extrabold px-7 py-2.5 rounded-full text-xs transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-spotify-green/20 flex items-center space-x-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Apply Avatar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
