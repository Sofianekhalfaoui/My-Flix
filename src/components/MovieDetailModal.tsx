import React, { useEffect, useState } from 'react';
import { Play, Plus, ArrowLeft, MessageCircle, Instagram, Disc, Clapperboard, Star, Calendar, Clock, Share2, Heart, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '../types';
import { tmdb } from '../services/tmdbService';
import { useFavorites } from '../context/FavoritesContext';

interface MovieDetailModalProps {
  movie: Movie | null;
  onClose: () => void;
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ movie, onClose }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [fullMovie, setFullMovie] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isPlayingMain, setIsPlayingMain] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<{ season: number, episode: number } | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [fetchingEpisodes, setFetchingEpisodes] = useState(false);

  useEffect(() => {
    if (movie) {
      setLoading(true);
      tmdb.getMovieDetails(movie.id, movie.type).then(data => {
        setFullMovie(data);
        setLoading(false);
        if (data?.type === 'tv' && data.seasons?.length > 0) {
          // Find first actual season (skip season 0 / specials usually)
          const firstSeason = data.seasons.find((s: any) => s.season_number > 0) || data.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      });
    } else {
      setFullMovie(null);
      setIsPlayingTrailer(false);
      setEpisodes([]);
    }
  }, [movie]);

  useEffect(() => {
    if (fullMovie?.type === 'tv' && movie) {
      setFetchingEpisodes(true);
      tmdb.getSeasonDetails(movie.id, selectedSeason).then(data => {
        setEpisodes(data);
        setFetchingEpisodes(false);
      });
    }
  }, [selectedSeason, fullMovie?.id, movie?.id]);

  if (!movie) return null;

  const currentMovie = fullMovie || movie;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black overflow-y-auto no-scrollbar pb-20"
      >
        {/* Main Video Player Overlay */}
        <AnimatePresence>
          {isPlayingMain && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black flex flex-col"
            >
              <div className="absolute top-6 left-6 z-[160] flex items-center gap-4">
                <button 
                  onClick={() => {
                    setIsPlayingMain(false);
                    setActiveEpisode(null);
                  }}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-sm font-black italic uppercase tracking-tighter leading-none">{currentMovie.title}</h2>
                  {activeEpisode && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">
                      Season {activeEpisode.season}, Episode {activeEpisode.episode}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-1 w-full bg-black">
                <iframe
                  src={
                    currentMovie.type === 'movie' 
                      ? `https://vidsrc.me/embed/movie?tmdb=${currentMovie.id}`
                      : `https://vidsrc.me/embed/tv?tmdb=${currentMovie.id}&sea=${activeEpisode?.season || 1}&epi=${activeEpisode?.episode || 1}`
                  }
                  title="Video Player"
                  className="w-full h-full border-none"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trailer Overlay */}
        <AnimatePresence>
          {isPlayingTrailer && currentMovie.videoKey && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black flex flex-col pt-20"
            >
              <div className="absolute top-6 left-6 z-[120]">
                <button 
                  onClick={() => setIsPlayingTrailer(false)}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/20 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="w-full aspect-video md:max-w-5xl md:mx-auto">
                <iframe
                  src={`https://www.youtube.com/embed/${currentMovie.videoKey}?autoplay=1&rel=0&modestbranding=1`}
                  title="Trailer"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6 md:p-12 md:max-w-5xl md:mx-auto w-full">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{currentMovie.title} - Official Trailer</h2>
                 <p className="text-white/60 text-sm">{currentMovie.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Background Blur (Kept for depth) */}
        <div className="fixed inset-0 w-full h-screen pointer-events-none overflow-hidden origin-center">
          <motion.img 
            key={currentMovie.bannerUrl}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.3, scale: 1.1 }}
            transition={{ duration: 1 }}
            src={currentMovie.bannerUrl} 
            className="w-full h-full object-cover blur-[100px]" 
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Banner Image */}
        <div className="relative w-full aspect-[16/10] max-h-[45vh] overflow-hidden">
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            src={currentMovie.bannerUrl} 
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
          
          {/* Floating UI on Banner */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between pointer-events-none">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer pointer-events-auto border border-white/10 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-3 pointer-events-auto">
               <button 
                  onClick={() => toggleFavorite(currentMovie)}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer border border-white/10 active:scale-90"
                >
                  <Heart className={`w-5 h-5 ${isFavorite(currentMovie.id) ? 'fill-red-600 text-red-600' : 'text-white'}`} />
                </button>
                <button 
                  onClick={() => {
                    const shareData = {
                      title: currentMovie.title,
                      text: `Check out ${currentMovie.title} on MY FLIX!`,
                      url: window.location.origin,
                    };
                    if (navigator.share) {
                      navigator.share(shareData).catch(err => console.log('Share failed', err));
                    } else {
                      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                      alert('تم نسخ الرابط بنجاح!');
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer border border-white/10 active:scale-90"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
            </div>
          </div>
        </div>

        {/* Main App-like Container */}
        <div className="relative z-10 max-w-2xl mx-auto px-6 -mt-12">
          
          {/* Basic Info Section */}
          <div className="flex flex-col items-center text-center space-y-4">
             <motion.div 
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="space-y-3"
             >
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic leading-tight drop-shadow-2xl">{currentMovie.title}</h1>
                <div className="flex items-center justify-center gap-4 text-[10px] font-black text-white/50 uppercase tracking-widest">
                  <span>{currentMovie.year}</span>
                  <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-white text-[9px]">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    {currentMovie.rating?.toFixed(1)}
                  </div>
                  <span>{currentMovie.duration || '120 MIN'}</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                   {currentMovie.genre.slice(0, 3).map((g, idx) => (
                      <span key={`${g}-${idx}`} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/60 tracking-tighter">
                        {g}
                      </span>
                   ))}
                </div>
             </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-8">
             <button 
                onClick={() => {
                  if (currentMovie.type === 'tv') {
                    // Start from first episode of selected season if nothing playing
                    setActiveEpisode({ season: selectedSeason, episode: 1 });
                  }
                  setIsPlayingMain(true);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
             >
                <Play className="w-6 h-6 fill-white" />
                <span>{currentMovie.type === 'tv' ? 'WATCH SERIES' : 'PLAY MOVIE'}</span>
             </button>
             
             <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-colors font-black text-sm uppercase">
                  <Plus className="w-4 h-4" />
                  <span>MY LIST</span>
                </button>
                <button 
                  onClick={() => setIsPlayingTrailer(true)}
                  disabled={!currentMovie.videoKey}
                  className={`flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-2xl transition-all font-black text-sm uppercase ${!currentMovie.videoKey ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer active:scale-95'}`}
                >
                  <Clapperboard className="w-4 h-4" />
                  <span>TRAILER</span>
                </button>
             </div>
          </div>

          {/* Overview */}
          <div className="pt-10 space-y-3">
             <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-red-600 rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Overview</h2>
             </div>
             <p className="text-sm text-white/70 leading-relaxed text-justify font-medium">
               {currentMovie.description}
             </p>
          </div>

          {/* Seasons & Episodes Section (Only for TV) */}
          {currentMovie.type === 'tv' && currentMovie.seasons && (
            <div className="pt-10 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-red-600 rounded-full" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Seasons</h2>
                  </div>
                  <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    {episodes.length} Episodes
                  </div>
               </div>

               {/* Season Selector */}
               <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {currentMovie.seasons
                    .filter((s: any) => s.season_number > 0)
                    .map((season: any) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`px-5 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                        selectedSeason === season.season_number
                          ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                          : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      Season {season.season_number}
                    </button>
                  ))}
               </div>

               {/* Episodes List */}
               <div className="space-y-4 pt-2">
                  {fetchingEpisodes ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-red-600 animate-spin" /></div>
                  ) : (
                    episodes.map((episode) => (
                      <div 
                        key={episode.id} 
                        onClick={() => {
                          setActiveEpisode({ season: selectedSeason, episode: episode.episodeNumber });
                          setIsPlayingMain(true);
                        }}
                        className="group relative flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
                      >
                        <div className="relative w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                           {episode.stillPath ? (
                              <img src={episode.stillPath} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-white/10">S{selectedSeason}E{episode.episodeNumber}</div>
                           )}
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-6 h-6 fill-white text-white drop-shadow-lg" />
                           </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                           <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="text-[10px] font-black uppercase text-red-600 tracking-tighter">Episode {episode.episodeNumber}</div>
                              {episode.runtime && <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{episode.runtime} min</div>}
                           </div>
                           <h3 className="text-xs font-black uppercase tracking-tight truncate group-hover:text-red-500 transition-colors uppercase">{episode.name}</h3>
                           <p className="text-[9px] text-white/40 line-clamp-2 mt-1 leading-normal font-medium">{episode.overview || 'No description available for this episode.'}</p>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          )}

          {/* Cast */}
          <div className="pt-10 space-y-5">
             <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-red-600 rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Leading Cast</h2>
             </div>
             
             <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 mask-fade-right">
                {currentMovie.cast?.map((person, idx) => (
                  <div key={idx} className="min-w-[70px] flex flex-col items-center gap-2 text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shadow-lg">
                      {person.profilePath ? (
                        <img src={person.profilePath} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <span className="text-white/20 font-black">{person.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-black uppercase leading-tight line-clamp-1">{person.name.split(' ')[0]}</div>
                      <div className="text-[8px] font-bold text-white/30 truncate">{person.character.split(' ')[0]}</div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Footer Branding */}
          <div className="pt-12 flex justify-center opacity-20">
             <div className="text-2xl font-black italic text-red-600 uppercase tracking-tighter">My Flix</div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MovieDetailModal;
