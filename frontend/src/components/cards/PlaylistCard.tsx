import React from "react";
import { Link } from "react-router-dom";
import { Playlist } from "../../types";

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className="group bg-spotify-darkGray/60 hover:bg-spotify-lightGray p-4 rounded-xl transition-all duration-300 hover:shadow-2xl flex flex-col justify-between cursor-pointer"
    >
      <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-lg shadow-md bg-neutral-900">
        <img
          src={playlist.coverImageUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300"}
          alt={playlist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div>
        <h4 className="font-bold text-sm text-white truncate group-hover:underline">{playlist.name}</h4>
        <p className="text-xs text-spotify-textMuted line-clamp-2 mt-1">
          {playlist.description || `By ${playlist.ownerName}`}
        </p>
      </div>
    </Link>
  );
};
