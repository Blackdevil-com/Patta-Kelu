import React from "react";
import { Link } from "react-router-dom";
import { Artist } from "../../types";
import { formatNumber } from "../../utils/format";

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link
      to={`/artist/${artist.id}`}
      className="group bg-spotify-darkGray/60 hover:bg-spotify-lightGray p-4 rounded-xl transition-all duration-300 hover:shadow-2xl flex flex-col items-center text-center cursor-pointer"
    >
      <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-full shadow-lg bg-neutral-900 max-w-[160px]">
        <img
          src={artist.profileImageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300"}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <h4 className="font-bold text-sm text-white truncate w-full group-hover:underline">
        {artist.name}
      </h4>
      <p className="text-xs text-spotify-textMuted mt-1">
        {formatNumber(artist.monthlyListeners)} monthly listeners
      </p>
    </Link>
  );
};
