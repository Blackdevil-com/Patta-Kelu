import React from "react";
import { Link } from "react-router-dom";
import { Album } from "../../types";

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  return (
    <Link
      to={`/album/${album.id}`}
      className="group bg-spotify-darkGray/60 hover:bg-spotify-lightGray p-4 rounded-xl transition-all duration-300 hover:shadow-2xl flex flex-col justify-between cursor-pointer"
    >
      <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-lg shadow-md bg-neutral-900">
        <img
          src={album.coverImageUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300"}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div>
        <h4 className="font-bold text-sm text-white truncate group-hover:underline">{album.title}</h4>
        <p className="text-xs text-spotify-textMuted truncate mt-1">
          {album.releaseDate ? new Date(album.releaseDate).getFullYear() : ""} • {album.artistName}
        </p>
      </div>
    </Link>
  );
};
