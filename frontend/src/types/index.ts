export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  bio?: string;
  country?: string;
  roles: string[];
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string;
  albumTitle?: string;
  duration: number; // in seconds
  coverImageUrl?: string;
  streamUrl: string;
  trackNumber?: number;
  releaseDate?: string;
  playCount: number;
  isLiked?: boolean;
  genres?: string[];
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  monthlyListeners: number;
  verified: boolean;
  isFollowed?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverImageUrl?: string;
  albumType: string;
  releaseDate: string;
  totalTracks: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  isPublic: boolean;
  ownerId: string;
  ownerName: string;
  trackCount: number;
  createdAt: string;
  tracks?: Song[];
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  colorCode: string;
}

export interface SearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface HomeFeed {
  trendingSongs: Song[];
  newReleases: Song[];
  recommendations: Song[];
  topArtists: Artist[];
  popularAlbums: Album[];
  featuredPlaylists: Playlist[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
