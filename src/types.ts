export interface Movie {
  id: string;
  title: string;
  description: string;
  rating: number;
  year: string;
  genre: string[];
  bannerUrl: string;
  thumbnailUrl: string;
  trailerUrl?: string;
  duration?: string;
  voteCount?: number;
  videoKey?: string; // YouTube video ID for trailers
  genres?: { id: number; name: string }[];
  cast?: { name: string; character: string; profilePath: string | null }[];
  type?: 'movie' | 'tv';
}
