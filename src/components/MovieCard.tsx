import React from 'react';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onMoreInfo: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onMoreInfo }) => {
  const ratingPercentage = Math.round(movie.rating * 10);
  const strokeDasharray = 2 * Math.PI * 18;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * ratingPercentage) / 100;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col gap-3 min-w-[140px] md:min-w-[180px] group cursor-pointer"
      onClick={() => onMoreInfo(movie)}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/5 bg-neutral-900">
        <img 
          src={movie.thumbnailUrl} 
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Circular Rating UI (TMDB Style) */}
        <div className="absolute -bottom-4 left-3 w-10 h-10 bg-black rounded-full flex items-center justify-center border-2 border-black shadow-xl z-20">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="transparent"
              stroke="#204529"
              strokeWidth="2"
            />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="transparent"
              stroke={ratingPercentage >= 70 ? "#21d17e" : ratingPercentage >= 40 ? "#d2d531" : "#db2360"}
              strokeWidth="2"
              strokeDasharray={strokeDasharray}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">{ratingPercentage}<span className="text-[6px]">%</span></span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <Play className="w-5 h-5 fill-white" />
          </div>
        </div>
      </div>

      <div className="pt-2 px-1 space-y-1">
        <h3 className="text-sm font-black text-white/90 line-clamp-1 group-hover:text-red-500 transition-colors uppercase tracking-tight">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40">
          <span>{movie.year}</span>
          <span>•</span>
          <span className="uppercase">{movie.genre[0]}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
