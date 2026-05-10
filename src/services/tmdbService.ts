import axios from 'axios';
import { Movie } from '../types';

const API_KEY = (import.meta as any).env?.VITE_TMDB_API_KEY || '454143a044741790987902eace898c10';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

const GENRE_MAP: { [key: number]: string } = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

export const tmdb = {
  getTrending: async (): Promise<Movie[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/trending/movie/day`, {
        params: { api_key: API_KEY, language: 'en-US' }
      });

      return response.data.results.slice(0, 20).map((m: any) => ({
        id: m.id.toString(),
        title: m.title,
        description: m.overview,
        rating: m.vote_average,
        year: m.release_date?.split('-')[0] || '',
        genre: Array.from(new Set(m.genre_ids.map((id: number) => GENRE_MAP[id] || 'Action'))).slice(0, 3) as string[],
        bannerUrl: `${IMAGE_BASE_URL}${m.backdrop_path}`,
        thumbnailUrl: `${IMAGE_BASE_URL}${m.poster_path}`,
        voteCount: m.vote_count,
        type: 'movie'
      }));
    } catch (error) {
      console.error('Error fetching trending TMDB data:', error);
      return [];
    }
  },

  getPopularMovies: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/movie/popular`, {
        params: { api_key: API_KEY, language: 'en-US', page }
      });

      return response.data.results.map((m: any) => ({
        id: m.id.toString(),
        title: m.title,
        description: m.overview,
        rating: m.vote_average,
        year: m.release_date?.split('-')[0] || '',
        genre: Array.from(new Set(m.genre_ids.map((id: number) => GENRE_MAP[id] || 'Action'))).slice(0, 3) as string[],
        bannerUrl: `${IMAGE_BASE_URL}${m.backdrop_path}`,
        thumbnailUrl: `${IMAGE_BASE_URL}${m.poster_path}`,
        voteCount: m.vote_count,
        type: 'movie'
      }));
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      return [];
    }
  },

  getPopularTVShows: async (page: number = 1): Promise<Movie[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/tv/popular`, {
        params: { api_key: API_KEY, language: 'en-US', page }
      });

      return response.data.results.map((m: any) => ({
        id: m.id.toString(),
        title: m.name,
        description: m.overview,
        rating: m.vote_average,
        year: m.first_air_date?.split('-')[0] || '',
        genre: Array.from(new Set(m.genre_ids.map((id: number) => GENRE_MAP[id] || 'TV Show'))).slice(0, 3) as string[],
        bannerUrl: `${IMAGE_BASE_URL}${m.backdrop_path}`,
        thumbnailUrl: `${IMAGE_BASE_URL}${m.poster_path}`,
        voteCount: m.vote_count,
        type: 'tv'
      }));
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
      return [];
    }
  },

  getTrendingWithVideos: async (): Promise<Movie[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/trending/movie/day`, {
        params: { api_key: API_KEY, language: 'en-US' }
      });

      const moviesWithVideos = await Promise.all(
        response.data.results.slice(0, 10).map(async (m: any) => {
          const videoRes = await axios.get(`${BASE_URL}/movie/${m.id}/videos`, {
            params: { api_key: API_KEY }
          });
          
          const trailer = videoRes.data.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          
          return {
            id: m.id.toString(),
            title: m.title,
            description: m.overview,
            rating: m.vote_average,
            year: m.release_date?.split('-')[0] || '',
            genre: Array.from(new Set(m.genre_ids.map((id: number) => GENRE_MAP[id] || 'Action'))).slice(0, 3) as string[],
            bannerUrl: `${IMAGE_BASE_URL}${m.backdrop_path}`,
            thumbnailUrl: `${IMAGE_BASE_URL}${m.poster_path}`,
            videoKey: trailer?.key,
            voteCount: m.vote_count,
            type: 'movie'
          };
        })
      );

      return moviesWithVideos;
    } catch (error) {
      console.error('Error fetching trending with videos:', error);
      return [];
    }
  },

  getMovieDetails: async (id: string, type: string = 'movie'): Promise<any> => {
    try {
      const endpoint = type === 'tv' ? 'tv' : 'movie';
      const [details, credits, videos] = await Promise.all([
        axios.get(`${BASE_URL}/${endpoint}/${id}`, { params: { api_key: API_KEY, language: 'en-US' } }),
        axios.get(`${BASE_URL}/${endpoint}/${id}/credits`, { params: { api_key: API_KEY } }),
        axios.get(`${BASE_URL}/${endpoint}/${id}/videos`, { params: { api_key: API_KEY } })
      ]);

      const trailer = videos.data.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || 
                      videos.data.results.find((v: any) => v.site === 'YouTube');

      return {
        id: details.data.id.toString(),
        title: details.data.title || details.data.name,
        description: details.data.overview,
        rating: details.data.vote_average,
        year: (details.data.release_date || details.data.first_air_date)?.split('-')[0] || '',
        duration: details.data.runtime ? `${details.data.runtime} min` : details.data.episode_run_time?.[0] ? `${details.data.episode_run_time[0]} min` : '',
        genres: details.data.genres,
        genre: details.data.genres.map((g: any) => g.name),
        bannerUrl: `${IMAGE_BASE_URL}${details.data.backdrop_path}`,
        thumbnailUrl: `${IMAGE_BASE_URL}${details.data.poster_path}`,
        videoKey: trailer?.key,
        type: endpoint === 'tv' ? 'tv' : 'movie',
        seasons: details.data.seasons || [],
        cast: credits.data.cast.slice(0, 10).map((c: any) => ({
          name: c.name,
          character: c.character,
          profilePath: c.profile_path ? `${IMAGE_BASE_URL}${c.profile_path}` : null
        }))
      };
    } catch (error) {
      console.error('Error fetching details:', error);
      return null;
    }
  },

  getSeasonDetails: async (showId: string, seasonNumber: number): Promise<any[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/tv/${showId}/season/${seasonNumber}`, {
        params: { api_key: API_KEY, language: 'en-US' }
      });
      return response.data.episodes.map((e: any) => ({
        id: e.id,
        episodeNumber: e.episode_number,
        name: e.name,
        overview: e.overview,
        stillPath: e.still_path ? `${IMAGE_BASE_URL}${e.still_path}` : null,
        airDate: e.air_date,
        runtime: e.runtime
      }));
    } catch (error) {
      console.error('Error fetching season details:', error);
      return [];
    }
  },

  getCredits: async (id: string) => {
    const res = await axios.get(`${BASE_URL}/movie/${id}/credits`, {
      params: { api_key: API_KEY }
    });
    return res.data.cast.slice(0, 10).map((c: any) => ({
      name: c.name,
      character: c.character,
      profilePath: c.profile_path ? `${IMAGE_BASE_URL}${c.profile_path}` : null
    }));
  },

  searchMovies: async (query: string): Promise<Movie[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/search/multi`, {
        params: { api_key: API_KEY, query, language: 'en-US' }
      });

      return response.data.results
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 10)
        .map((m: any) => ({
          id: m.id.toString(),
          title: m.title || m.name,
          description: m.overview,
          rating: m.vote_average,
          year: (m.release_date || m.first_air_date)?.split('-')[0] || '',
          genre: [],
          bannerUrl: `${IMAGE_BASE_URL}${m.backdrop_path}`,
          thumbnailUrl: `${IMAGE_BASE_URL}${m.poster_path}`,
          type: m.media_type
        }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
};
