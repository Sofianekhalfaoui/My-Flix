import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Info, Volume2, VolumeX, ChevronRight, Pause, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '../types';
import { useFavorites } from '../context/FavoritesContext';

interface HeroProps {
  movies: Movie[];
  onMoreInfo: (movie: Movie) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const Hero: React.FC<HeroProps> = ({ movies, onMoreInfo }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const playerRef = useRef<any>(null);
  const heroMovies = React.useMemo(() => movies.slice(0, 10), [movies]);
  const currentMovie = heroMovies[currentIndex];

  const prevMovie = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
    setShowVideo(false);
  }, [heroMovies.length]);

  const nextMovie = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
    setShowVideo(false);
  }, [heroMovies.length]);

  // Handle Swipe logic
  const onDragEnd = (_: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      nextMovie();
    } else if (info.offset.x > threshold) {
      prevMovie();
    }
  };

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  // Set delay for video show
  useEffect(() => {
    setShowVideo(false);
    const delayTimer = setTimeout(() => {
      setShowVideo(true);
    }, 2000); // 2 seconds delay before showing video
    return () => clearTimeout(delayTimer);
  }, [currentIndex]);

  // Initialize/Update Player
  useEffect(() => {
    if (!apiReady || !currentMovie?.videoKey || !showVideo) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(`hero-player-${currentIndex}`, {
      videoId: currentMovie.videoKey,
      playerVars: {
        autoplay: 1,
        mute: isMuted ? 1 : 0,
        loop: 0, // 0 to handle ENDED state
        playlist: currentMovie.videoKey,
        controls: 0,
        showinfo: 0,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        vq: 'hd1080'
      },
      events: {
        onReady: (event: any) => {
          event.target.playVideo();
          if (isMuted) event.target.mute();
          else event.target.unMute();
          
          if (isPaused) event.target.pauseVideo();
        },
        onStateChange: (event: any) => {
          // Auto advance when video ends
          if (event.data === window.YT.PlayerState.ENDED) {
            nextMovie();
          }
        }
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [apiReady, currentIndex, currentMovie?.videoKey, showVideo, nextMovie]);

  // Handle Audio/Pause Toggles - Apply to REF without re-creating player
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.mute === 'function') {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        // Sometimes unmuting triggers a pause in some browsers, force play
        playerRef.current.playVideo();
      }
    }
  }, [isMuted]);

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      if (isPaused) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  }, [isPaused]);

  if (!currentMovie) return null;

  return (
    <motion.div 
      className="relative h-[90vh] w-full overflow-hidden bg-black touch-none"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
    >
      {/* Background Banner - BASE LEVEL */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentMovie.id + "-backdrop"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            src={currentMovie.bannerUrl} 
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      {/* Video Overlay - LAYER ON TOP AFTER DELAY */}
      <AnimatePresence>
        {showVideo && currentMovie.videoKey && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 scale-125 pointer-events-none"
          >
            <div id={`hero-player-${currentIndex}`} className="w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/20 to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-black/30 z-20" />

      {/* Content */}
      <div className="relative z-30 h-full flex flex-col justify-center items-center text-center px-6 max-w-4xl mx-auto space-y-6 pt-20">
        <div className="flex flex-col items-center gap-4">
          <button 
             onPointerDown={(e) => e.stopPropagation()}
             onClick={() => setIsPaused(!isPaused)}
             className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-2 hover:bg-white/20 transition-all active:scale-90"
          >
            {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5 fill-white" />}
          </button>
          
          <div className="px-3 py-1 bg-red-600 rounded text-[10px] font-bold uppercase tracking-wider text-white">
            Trending Now
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-4"
          >
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase drop-shadow-2xl">
              {currentMovie.title}
            </h1>
            
            <p className="text-sm lg:text-base text-white/80 line-clamp-2 max-w-xl mx-auto leading-relaxed drop-shadow-lg">
              {currentMovie.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 pt-6">
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onMoreInfo(currentMovie)}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-2xl font-black hover:bg-white/20 transition-all active:scale-95 shadow-xl border border-white/20"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Play</span>
          </button>
          
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleFavorite(currentMovie)}
            className={`w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-black backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 border border-white/20`}
          >
            <Heart className={`w-6 h-6 ${isFavorite(currentMovie.id) ? 'fill-red-600 text-red-600' : ''}`} />
          </button>

          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setIsMuted(!isMuted)}
            className="w-14 h-14 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white active:scale-90"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex gap-1.5 pt-8">
          {heroMovies.map((_, idx) => (
            <div 
              key={idx}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                setCurrentIndex(idx);
                setShowVideo(false);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-8 bg-red-600' : 'w-4 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* PRO PLAN Badge */}
        <div className="pt-8">
          <div 
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md cursor-pointer hover:bg-black/60 transition-colors"
          >
            <span className="bg-red-600 px-2 py-0.5 rounded text-[8px] font-bold text-white">MovieBoxPro</span>
            <span className="text-[10px] font-bold text-white opacity-80">Discount</span>
            <ChevronRight className="w-3 h-3 text-white/50" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
