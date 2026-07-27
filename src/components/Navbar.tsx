import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Search, LogOut, Menu, Bookmark, Plus } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { fetchFromTmdb, getImageUrl } from '../lib/tmdb';
import { motion, AnimatePresence } from 'motion/react';
import NotesPanel from './NotesPanel';
import NotificationsPanel from './NotificationsPanel';
import LogModal from './LogModal';

export default function Navbar() {
  const { user, userData, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Keep track of the previous user ID
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user ? user.uid : null;
    if (prevUserIdRef.current !== currentUserId) {
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      prevUserIdRef.current = currentUserId;
    }
  }, [user]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length > 1) {
        try {
          const res = await fetchFromTmdb('/search/multi', { query: query.trim(), include_adult: 'false' });
          if (res && res.results) {
            const filteredResults = res.results.filter((item: any) => item.media_type !== 'person');
            setSuggestions(filteredResults.slice(0, 5));
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center h-20 w-full">
          <div className="flex items-center shrink-0 mr-4 xl:mr-8">
            <Link to="/" onClick={() => window.scrollTo(0,0)} className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-[#38bdf8]">
                cine<span className="text-white">critiq</span>
              </h1>
            </Link>
          </div>

          <div className="hidden lg:flex items-center mr-auto gap-4 xl:gap-6">
            <Link to="/" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-white transition-colors">Home</Link>
            <Link to="/movies" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-white transition-colors">Movies</Link>
            <Link to="/series" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-white transition-colors">Series</Link>
            <Link to="/anime" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-white transition-colors">Anime</Link>
            <Link to="/kids" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-white transition-colors">Kids</Link>
            <Link to="/horror" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#8B0000] transition-colors">Horror</Link>
            <Link to="/shuffle" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#38bdf8] transition-colors">Shuffle</Link>
            <Link to="/community" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#38bdf8] transition-colors">Members</Link>
            <Link to="/games" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#38bdf8] transition-colors">Games</Link>
          </div>

          <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0 ml-4">
            <div className="relative" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-white/40" />
              </div>
              <input
                type="text"
                placeholder="Search movies or users..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (query.trim().length > 1) setShowSuggestions(true);
                }}
                className="bg-white/10 border border-white/20 text-sm rounded-full block w-56 pl-10 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#38bdf8] transition-all"
              />
            </form>
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100]"
                >
                  {suggestions.map((movie, idx) => (
                    <Link
                      key={`${movie.id}-${idx}`}
                      to={`/movie/${movie.id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setQuery('');
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-14 bg-[#2a2a2a] rounded overflow-hidden flex-shrink-0">
                        {movie.poster_path ? (
                          <img src={getImageUrl(movie.poster_path, 'w92')} alt={movie.title || movie.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-white/40">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{movie.title || movie.name}</div>
                        <div className="text-white/40 text-xs">{(movie.release_date || movie.first_air_date) ? (movie.release_date || movie.first_air_date).split('-')[0] : 'N/A'}</div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full p-2 text-center text-xs font-bold text-[#38bdf8] hover:bg-white/10 transition-colors border-t border-white/10"
                  >
                    View all results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            <NotesPanel />
            
            {user && <NotificationsPanel />}

            {user && (
              <button
                onClick={() => setLogModalOpen(true)}
                className="bg-[#facc15] hover:opacity-80 text-black px-4 py-1.5 rounded-[3px] text-[13px] font-bold uppercase tracking-wide flex items-center gap-1 transition-opacity whitespace-nowrap font-sans"
              >
                <Plus className="w-4 h-4" /> LOG
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#38bdf8] to-[#D4AF37] border border-white/20 overflow-hidden group-hover:opacity-80 transition-opacity">
                    <img src={userData?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName || user.displayName || 'User'}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white text-sm font-medium hidden sm:block group-hover:text-[#38bdf8] transition-colors">{userData?.displayName || user.displayName || 'User'}</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#38bdf8] hover:bg-[#0284c7] text-white px-5 py-2 rounded font-bold text-sm transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          <button className="lg:hidden text-gray-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-black/95 border-b border-white/10 overflow-y-auto max-h-[85vh]"
          >
            <div className="px-4 py-3 flex flex-col gap-3 text-sm">
              <div className="relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search movies or users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-4 pr-10 text-sm text-white"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>
              <AnimatePresence>
              {query.trim().length > 1 && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden"
                >
                  {suggestions.map((movie, idx) => (
                    <Link
                      key={`${movie.id}-${idx}`}
                      to={`/movie/${movie.id}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setQuery('');
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="w-10 h-14 bg-[#2a2a2a] rounded overflow-hidden flex-shrink-0">
                        {movie.poster_path ? (
                          <img src={getImageUrl(movie.poster_path, 'w92')} alt={movie.title || movie.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-white/40">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{movie.title || movie.name}</div>
                        <div className="text-white/40 text-xs">{(movie.release_date || movie.first_air_date) ? (movie.release_date || movie.first_air_date).split('-')[0] : 'N/A'}</div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full p-2 text-center text-xs font-bold text-[#38bdf8] hover:bg-white/10 transition-colors"
                  >
                    View all results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
              <Link to="/" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Home</Link>
              <Link to="/movies" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Movies</Link>
              <Link to="/series" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Series</Link>
              <Link to="/anime" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Anime</Link>
              <Link to="/kids" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-[#4CC9FE] hover:text-[#4CC9FE]/80">Kids Zone</Link>
              <Link to="/horror" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-[#8B0000] hover:text-[#8B0000]/80">Horror</Link>
              <Link to="/shuffle" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Shuffle</Link>
              <Link to="/community" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Members</Link>
              <Link to="/games" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Games</Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Profile</Link>
                  <button onClick={() => { setLogModalOpen(true); setMobileMenuOpen(false); }} className="bg-[#facc15] hover:opacity-80 text-black py-2 rounded-[3px] mt-2 text-[13px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 font-sans transition-opacity">
                    <Plus className="w-5 h-5" /> LOG FILM
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="bg-[#38bdf8] text-center text-white py-2 rounded mt-2">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <LogModal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} />
    </nav>
  );
}
