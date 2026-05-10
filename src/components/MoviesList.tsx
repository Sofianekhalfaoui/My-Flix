import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '../types';

interface MoviesListProps {
  title: string;
  movies: Movie[];
  onMoreInfo: (movie: Movie) => void;
}

const MoviesList: React.FC<MoviesListProps> = ({ title, movies, onMoreInfo }) => {
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
    <div className="space-y-4 py-6 group/row">
      <h2 className="px-6 lg:px-12 text-lg font-black text-white/90 tracking-tight uppercase">
        {title}
      </h2>

      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/40 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/60 backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar px-6 lg:px-12 pb-6 scroll-smooth"
        >
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} onMoreInfo={onMoreInfo} />
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/40 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/60 backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default MoviesList;
