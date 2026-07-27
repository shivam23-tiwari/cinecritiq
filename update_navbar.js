import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add imports
if (!content.includes('fetchFromTmdb')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { fetchFromTmdb, getImageUrl } from '../lib/tmdb';");
  // Also add to other variants if present
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { fetchFromTmdb, getImageUrl } from '../lib/tmdb';");
}

// Add state and effect
const stateToAdd = `
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length > 1) {
        try {
          const res = await fetchFromTmdb('/search/movie', { query: query.trim(), include_adult: 'false' });
          if (res && res.results) {
            setSuggestions(res.results.slice(0, 5));
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
`;

content = content.replace("const [logModalOpen, setLogModalOpen] = useState(false);", "const [logModalOpen, setLogModalOpen] = useState(false);" + stateToAdd);

// Find the form and wrap in ref, add dropdown
const formToReplace = `<form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-white/40" />
              </div>
              <input
                type="text"
                placeholder="Search movies or users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white/10 border border-white/20 text-sm rounded-full block w-56 pl-10 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-all"
              />
            </form>`;

const formReplacement = `<div className="relative" ref={searchContainerRef}>
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
                className="bg-white/10 border border-white/20 text-sm rounded-full block w-56 pl-10 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-all"
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
                  {suggestions.map((movie) => (
                    <Link
                      key={movie.id}
                      to={\`/movie/\${movie.id}\`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setQuery('');
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-14 bg-[#2a2a2a] rounded overflow-hidden flex-shrink-0">
                        {movie.poster_path ? (
                          <img src={getImageUrl(movie.poster_path, 'w92')} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-white/40">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{movie.title}</div>
                        <div className="text-white/40 text-xs">{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full p-2 text-center text-xs font-bold text-[#E50914] hover:bg-white/10 transition-colors border-t border-white/10"
                  >
                    View all results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>`;

content = content.replace(formToReplace, formReplacement);

// Mobile form replacement
const mobileFormToReplace = `<form onSubmit={handleSearch} className="relative">
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
              </form>`;

const mobileFormReplacement = `<div className="relative">
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
                  {suggestions.map((movie) => (
                    <Link
                      key={movie.id}
                      to={\`/movie/\${movie.id}\`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setQuery('');
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="w-10 h-14 bg-[#2a2a2a] rounded overflow-hidden flex-shrink-0">
                        {movie.poster_path ? (
                          <img src={getImageUrl(movie.poster_path, 'w92')} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-white/40">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{movie.title}</div>
                        <div className="text-white/40 text-xs">{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full p-2 text-center text-xs font-bold text-[#E50914] hover:bg-white/10 transition-colors"
                  >
                    View all results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>`;

content = content.replace(mobileFormToReplace, mobileFormReplacement);

fs.writeFileSync('src/components/Navbar.tsx', content);
