import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, User, Menu, X, Home, Film, Tv, Heart, Settings, LogOut, ShoppingBag, Baby, Ghost, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { tmdb } from '../services/tmdbService';
import { Movie } from '../types';

import Logo from './Logo';

interface NavbarProps {
  onSelectMovie: (movie: Movie) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSelectMovie }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const delayDebounceFn = setTimeout(async () => {
        const results = await tmdb.searchMovies(searchQuery);
        
        // Filter based on current page
        let filtered = results;
        if (location.pathname === '/movies') {
          filtered = results.filter(m => m.type === 'movie');
        } else if (location.pathname === '/tv') {
          filtered = results.filter(m => m.type === 'tv');
        }
        
        setSearchResults(filtered);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, location.pathname]);

  const searchPlaceholder = useMemo(() => {
    if (location.pathname === '/movies') return "Search movies only...";
    if (location.pathname === '/tv') return "Search TV series only...";
    return "Search movies & series...";
  }, [location.pathname]);

  useEffect(() => {
    if ((isSearchOpen && searchResults.length > 0) || isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSearchOpen, searchResults, isMenuOpen]);

  const menuItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Movies', icon: Film, path: '/movies' },
    { label: 'Tv Series', icon: Tv, path: '/tv' },
    { label: 'Kids', icon: Baby, path: '#' },
    { label: 'Anime', icon: Ghost, path: '#' },
  ];

  const secondaryItems = [
    { label: 'Favorites', icon: Heart, path: '/favorites' },
    { label: 'Setting', icon: Settings, path: '#' },
    { label: 'TryStore', icon: ShoppingBag, path: '#' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 lg:px-12 py-4 flex items-center justify-between ${
          isScrolled ? 'bg-bg-dark/95 backdrop-blur-md border-b border-white/5' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
      <div className="flex items-center gap-12">
        <Link to="/">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Logo />
          </motion.div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/50">
          <NavLink to="/" className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white' : ''}`}>Home</NavLink>
          <NavLink to="/tv" className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white' : ''}`}>TV Series</NavLink>
          <NavLink to="/movies" className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white' : ''}`}>Movies</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `hover:text-white transition-colors ${isActive ? 'text-white' : ''}`}>Favorites</NavLink>
        </div>
      </div>

      <div className="flex items-center gap-6 text-white/80">
        <div className="relative">
          <div className={`flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-3 py-1.5 transition-all duration-300 ${isSearchOpen ? 'w-64 border-white/30' : 'w-10 overflow-hidden'}`}>
            <Search 
              className="w-5 h-5 stroke-[2.5] cursor-pointer min-w-[20px]" 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
            <input 
              type="text"
              placeholder={searchPlaceholder}
              className="bg-transparent border-none outline-none text-xs w-full ml-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
            />
            {isSearchOpen && searchQuery && (
              <X 
                className="w-4 h-4 cursor-pointer text-white/40 hover:text-white"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              />
            )}
          </div>

          <AnimatePresence>
            {isSearchOpen && searchResults.length > 0 && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSearchOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] h-screen w-screen -right-6 lg:-right-12 top-0"
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 w-80 bg-bg-dark/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-[70vh] overflow-y-auto no-scrollbar"
                >
                  {searchResults.map((movie) => (
                    <div 
                      key={movie.id}
                      onClick={() => {
                        onSelectMovie(movie);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-none"
                    >
                      <img src={movie.thumbnailUrl} alt={movie.title} className="w-12 h-16 object-cover rounded shadow" />
                      <div className="overflow-hidden">
                        <div className="text-sm font-black truncate">{movie.title}</div>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-bold italic">
                          <span className={movie.type === 'movie' ? 'text-red-500' : 'text-blue-500'}>
                            {movie.type === 'movie' ? 'Film' : 'Series'}
                          </span>
                          <span>•</span>
                          <span>{movie.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center overflow-hidden cursor-pointer">
           <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="Profile" 
            className="w-full h-full"
          />
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>

    {/* Side Menu Overlay */}
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-3xl"
        >
          {/* Menu Content Container */}
          <div className="relative w-full h-full max-w-md p-6 flex flex-col bg-white/5 border-r border-white/10 shadow-2xl backdrop-blur-3xl">
            
            {/* Menu Header */}
            <div className="flex items-center justify-between mb-12">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <Logo />
              </Link>
              
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="p-1 hover:text-red-500 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-red-600/20">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                    alt="Profile" 
                    className="w-full h-full"
                  />
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 hover:text-red-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
              <div className="space-y-6 text-center md:text-left">
                {menuItems.map((item, idx) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-4 group cursor-pointer ${isActive ? 'text-white' : 'text-white/40 hover:text-white'} transition-colors`
                    }
                  >
                    {({ isActive }) => (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4"
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-red-600' : ''}`} />
                        <span className="text-lg font-black uppercase tracking-tight italic">{item.label}</span>
                      </motion.div>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Separator / Sub-navigation */}
              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-8 justify-center md:justify-start">
                  {secondaryItems.map((item, idx) => (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) => 
                        `flex items-center gap-2 group cursor-pointer ${isActive ? 'text-white' : 'text-white/40 hover:text-white'} transition-colors`
                      }
                    >
                      {({ isActive }) => (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + (idx * 0.05) }}
                          className="flex items-center gap-2"
                        >
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-red-600' : ''}`} />
                          {item.label === 'TryStore' && (
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                          )}
                          {item.label !== 'TryStore' && (
                            <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
                          )}
                        </motion.div>
                      )}
                    </NavLink>
                  ))}
                </div>

                {/* Tags Section */}
                <div className="flex flex-wrap gap-2 pt-4 justify-center md:justify-start">
                  {['One Piece', 'Marvel', 'Anime'].map((tag) => (
                    <span 
                      key={tag}
                      className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-12 text-center md:text-left">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 text-red-600 hover:text-red-500 transition-colors font-black uppercase tracking-tighter italic text-xl mx-auto md:mx-0"
                >
                  <LogOut className="w-6 h-6" />
                  <span>تسجيل الخروج</span>
                </motion.button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
};

export default Navbar;
