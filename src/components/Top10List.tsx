import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { motion } from 'motion/react';

interface Top10ListProps {
  movies: Movie[];
  onMoreInfo: (movie: Movie) => void;
}

const Top10List: React.FC<Top10ListProps> = ({ movies, onMoreInfo }) => {
  const rowRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 py-8 group/row">
      <h2 className="px-6 lg:px-12 text-xl font-black text-white/90 tracking-tight uppercase">
        Top 10 Movies Today
      </h2>

      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/40 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/60"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-8 overflow-x-auto no-scrollbar px-6 lg:px-12 pb-8"
        >
          {movies.slice(0, 10).map((movie, index) => {
            const ratingPercentage = Math.round(movie.rating * 10);
            const strokeDasharray = 2 * Math.PI * 18;
            const strokeDashoffset = strokeDasharray - (strokeDasharray * ratingPercentage) / 100;

            return (
              <motion.div 
                key={movie.id}
                whileHover={{ y: -5 }}
                className="relative min-w-[140px] md:min-w-[180px] aspect-[2/3] cursor-pointer group/card ml-10"
                onClick={() => onMoreInfo(movie)}
              >
                <div className="absolute -left-12 bottom-0 text-[160px] font-black text-transparent select-none z-0 leading-none drop-shadow-2xl" style={{ WebkitTextStroke: '3px rgba(255,255,255,0.15)' }}>
                  {index + 1}
                </div>
                <div className="relative z-10 w-full h-full">
                  <img 
                    src={movie.thumbnailUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover rounded-xl border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Rating Circle */}
                  <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-black rounded-full flex items-center justify-center border-2 border-black shadow-xl">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="20" cy="20" r="18" fill="transparent" stroke="#204529" strokeWidth="2" />
                      <circle
                        cx="20" cy="20" r="18" fill="transparent"
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
                </div>
              </motion.div>
            );
          })}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/40 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/60"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default Top10List;
