import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shuffle as ShuffleIcon, Star } from 'lucide-react';
import { fetchFromTmdb, getImageUrl } from '../lib/tmdb';
import { useNavigate } from 'react-router-dom';

export default function Shuffle() {
  const [loading, setLoading] = useState(false);
  const [bestMovies, setBestMovies] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFromTmdb('/movie/top_rated', { page: '1' }).then(res => {
      if (res?.results) {
         setBestMovies(res.results.slice(0, 2));
      }
    });
  }, []);

  const handleShuffle = async () => {
    setLoading(true);
    try {
      // Pick a random page from top rated movies to increase randomness
      const randomPage = Math.floor(Math.random() * 50) + 1;
      let res = await fetchFromTmdb('/movie/top_rated', { page: randomPage.toString() });
      
      // Try again with page 1 if random page fails (handling fallback data case)
      if (!res?.results?.length) {
         res = await fetchFromTmdb('/movie/top_rated', { page: '1' });
      }

      if (res && res.results && res.results.length > 0) {
        const randomMovie = res.results[Math.floor(Math.random() * res.results.length)];
        navigate(`/movie/${randomMovie.id}?fromShuffle=true`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 pt-16 text-center min-h-[70vh] w-full max-w-5xl mx-auto space-y-16">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-10 backdrop-blur-md shadow-2xl relative overflow-hidden shrink-0 mx-auto"
      >
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-[#38bdf8] rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>

        <div className="w-24 h-24 bg-gradient-to-tr from-[#38bdf8] to-red-500 rounded-full mx-auto flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(229,9,20,0.5)]">
          <ShuffleIcon className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Shuffle Mode</h1>
        <p className="text-white/60 mb-10 text-lg">
          Can't decide what to watch? Click the button and let us surprise you with a random movie!
        </p>
        
        <button
          onClick={handleShuffle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#38bdf8] hover:bg-[#0284c7] text-white py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <ShuffleIcon className="w-6 h-6" />
              Play Shuffle Movie
            </>
          )}
        </button>
      </motion.div>

      {bestMovies.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full text-left"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="text-yellow-500 fill-yellow-500 w-6 h-6" />
            A Pair of the Best Movies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {bestMovies.map((movie, idx) => (
              <div 
                key={`${movie.id}-${idx}`} 
                onClick={() => { window.scrollTo(0,0); navigate(`/movie/${movie.id}?fromShuffle=true`); }}
                className="bg-[#111] rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#38bdf8] transition-all flex h-[200px]"
              >
                <img 
                  src={getImageUrl(movie.poster_path, 'w500')} 
                  alt={movie.title} 
                  className="w-[130px] h-full object-cover object-center"
                />
                <div className="p-6 flex flex-col justify-center flex-1">
                  <h3 className="text-xl font-bold line-clamp-2">{movie.title}</h3>
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> {movie.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-white/50 text-sm">{movie.release_date?.substring(0, 4)}</span>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-3 leading-snug">
                    {movie.overview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
}
