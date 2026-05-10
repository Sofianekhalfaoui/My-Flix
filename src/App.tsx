import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MoviesList from './components/MoviesList';
import Top10List from './components/Top10List';
import MovieDetailModal from './components/MovieDetailModal';
import { Movie } from './types';
import { tmdb } from './services/tmdbService';
import { Loader2, ArrowLeft } from 'lucide-react';
import Logo from './components/Logo';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';

const HomePage: React.FC<{ 
  heroMovies: Movie[]; 
  trending: Movie[]; 
  popularMovies: Movie[]; 
  popularTV: Movie[]; 
  handleMoreInfo: (movie: Movie) => void;
}> = ({ heroMovies, trending, popularMovies, popularTV, handleMoreInfo }) => (
  <>
    {heroMovies.length > 0 && (
      <Hero 
        movies={heroMovies} 
        onMoreInfo={handleMoreInfo} 
      />
    )}

    <div className="relative z-20 -mt-24 space-y-4">
      {trending.length > 0 && (
        <Top10List 
          movies={trending} 
          onMoreInfo={handleMoreInfo} 
        />
      )}

      <MoviesList 
        title="Popular Movies" 
        movies={popularMovies} 
        onMoreInfo={handleMoreInfo} 
      />

      <MoviesList 
        title="Trending Series" 
        movies={popularTV} 
        onMoreInfo={handleMoreInfo} 
      />

      <MoviesList 
        title="New Releases" 
        movies={trending.slice(10)} 
        onMoreInfo={handleMoreInfo} 
      />
    </div>
  </>
);

const MoviesPage: React.FC<{ onMoreInfo: (movie: Movie) => void }> = ({ onMoreInfo }) => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMany = async () => {
      try {
        const pages = await Promise.all([
          tmdb.getPopularMovies(1),
          tmdb.getPopularMovies(2),
          tmdb.getPopularMovies(3),
          tmdb.getPopularMovies(4),
          tmdb.getPopularMovies(5)
        ]);
        const allMovies = pages.flat();
        const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());
        setMovies(uniqueMovies);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMany();
  }, []);

  if (loading) return <div className="pt-32 flex justify-center h-screen items-center bg-bg-dark"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>;

  return (
    <div className="pt-32 px-6 lg:px-12 pb-20">
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Movies</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map(movie => (
          <div key={movie.id} onClick={() => onMoreInfo(movie)} className="group cursor-pointer">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-red-600/50">
               <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 px-2 py-1 rounded">Watch Now</span>
               </div>
            </div>
            <h3 className="mt-3 text-sm font-bold uppercase truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>
            <div className="flex items-center gap-2 mt-1 opacity-50 text-[10px] font-bold">
               <span>{movie.year}</span>
               <span>•</span>
               <span className="text-yellow-500">★ {movie.rating?.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TVPage: React.FC<{ onMoreInfo: (movie: Movie) => void }> = ({ onMoreInfo }) => {
  const navigate = useNavigate();
  const [shows, setShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMany = async () => {
      try {
        const pages = await Promise.all([
          tmdb.getPopularTVShows(1),
          tmdb.getPopularTVShows(2),
          tmdb.getPopularTVShows(3),
          tmdb.getPopularTVShows(4),
          tmdb.getPopularTVShows(5)
        ]);
        const allShows = pages.flat();
        const uniqueShows = Array.from(new Map(allShows.map(m => [m.id, m])).values());
        setShows(uniqueShows);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMany();
  }, []);

  if (loading) return <div className="pt-32 flex justify-center h-screen items-center bg-bg-dark"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>;

  return (
    <div className="pt-32 px-6 lg:px-12 pb-20">
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">TV Series</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {shows.map(show => (
          <div key={show.id} onClick={() => onMoreInfo(show)} className="group cursor-pointer">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-red-600/50">
               <img src={show.thumbnailUrl} alt={show.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 px-2 py-1 rounded">Watch Now</span>
               </div>
            </div>
            <h3 className="mt-3 text-sm font-bold uppercase truncate group-hover:text-red-500 transition-colors">{show.title}</h3>
            <div className="flex items-center gap-2 mt-1 opacity-50 text-[10px] font-bold">
               <span>{show.year}</span>
               <span>•</span>
               <span className="text-yellow-500">★ {show.rating?.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FavoritesPage: React.FC<{ onMoreInfo: (movie: Movie) => void }> = ({ onMoreInfo }) => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();

  return (
    <div className="pt-32 px-6 lg:px-12 pb-20 min-h-[70vh]">
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">My Favorites</h1>
      </div>
      {favorites.length === 0 ? (
        <div className="text-center py-20 opacity-40 uppercase font-black italic text-xl">Your list is empty</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {favorites.map(movie => (
            <div key={movie.id} onClick={() => onMoreInfo(movie)} className="group cursor-pointer">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-red-600/50">
                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="mt-3 text-sm font-bold uppercase truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>
              <div className="flex items-center gap-2 mt-1 opacity-50 text-[10px] font-bold">
                 <span>{movie.year}</span>
                 <span>•</span>
                 <span className="text-yellow-500">★ {movie.rating?.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroData, popMovies, popTV, trendData] = await Promise.all([
          tmdb.getTrendingWithVideos(),
          tmdb.getPopularMovies(),
          tmdb.getPopularTVShows(),
          tmdb.getTrending()
        ]);
        setHeroMovies(heroData.map(m => ({ ...m, type: 'movie' })));
        setPopularMovies(popMovies.map(m => ({ ...m, type: 'movie' })));
        setPopularTV(popTV.map(m => ({ ...m, type: 'tv' })));
        setTrending(trendData.map(m => ({ ...m, type: 'movie' })));
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMoreInfo = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white selection:bg-neon-red/30 overflow-x-hidden">
      <ScrollToTop />
      <Navbar onSelectMovie={handleMoreInfo} />
      
      <main className="relative">
        <Routes>
          <Route path="/" element={
            <HomePage 
              heroMovies={heroMovies} 
              trending={trending} 
              popularMovies={popularMovies} 
              popularTV={popularTV} 
              handleMoreInfo={handleMoreInfo} 
            />
          } />
          <Route path="/movies" element={<MoviesPage onMoreInfo={handleMoreInfo} />} />
          <Route path="/tv" element={<TVPage onMoreInfo={handleMoreInfo} />} />
          <Route path="/favorites" element={<FavoritesPage onMoreInfo={handleMoreInfo} />} />
        </Routes>

        <div className="mt-24 px-12 lg:px-24 py-12 border-t border-white/5 space-y-8 flex flex-col md:flex-row justify-between items-center opacity-40">
          <Logo className="scale-75 origin-left" />
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">عن الخدمة</a>
            <a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a>
            <a href="#" className="hover:text-white transition-colors">الخصوصية</a>
            <a href="#" className="hover:text-white transition-colors">للاتصال بنا</a>
          </div>
          <div className="text-[10px] font-mono">© 2026 MY FLIX App. All rights reserved.</div>
        </div>
      </main>

      <MovieDetailModal 
        movie={selectedMovie} 
        onClose={() => setSelectedMovie(null)} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FavoritesProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </FavoritesProvider>
  );
};

export default App;
