import { Link, useNavigate } from 'react-router-dom';
import { fetchFromTmdb } from '../lib/tmdb';
import { useTrailer } from "../lib/TrailerContext";
import { motion } from 'motion/react';
import { Heart, Bookmark, Star, Play } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import { useAuth } from '../lib/AuthContext';
import React, { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from '../lib/firestore-wrapper';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { format } from 'date-fns';


interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export default function MovieCard({ movie: initialMovie, userRating, hideGlobalRating }: { movie: any; key?: any; userRating?: number; hideGlobalRating?: boolean }) {
  const [movie, setMovie] = useState<any>(initialMovie);
  
  useEffect(() => {
    if (initialMovie && (!initialMovie.title && !initialMovie.name) && initialMovie.id) {
      const fetchDetails = async () => {
        try {
           const type = initialMovie.media_type || 'movie';
           if (!initialMovie.id || initialMovie.id === 'undefined') return;
           const data = await fetchFromTmdb(`/${type}/${initialMovie.id}`);
           if (data && (data.title || data.name)) {
             setMovie({ ...initialMovie, ...data });
           }
        } catch (e) {
           console.error("Failed to fetch movie details", e);
        }
      };
      fetchDetails();
    }
  }, [initialMovie]);

  if (!movie) return null;
  const title = movie.title || movie.name || '';
  if (title.toLowerCase().includes('untitled')) return null;
  
  const { user, customPosters } = useAuth();
  const navigate = useNavigate();
  const { openTrailer } = useTrailer();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  let customPoster = customPosters?.[movie.id];
  


  useEffect(() => {
    if (user && movie.id && isHovered) {
      const checkActions = async () => {
        try {
          // Add local cache check first to save reads
          const cacheKey = `actions_${user.uid}_${movie.id}`;
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            setIsFavorite(parsed.isFavorite);
            setIsWatched(parsed.isWatched);
            return;
          }

          const favRef = doc(db, 'users', user.uid, 'movieActions', `favorite_${movie.id}`);
          let favSnap = await getDoc(favRef);
          if (!favSnap.exists()) {
             favSnap = await getDoc(doc(db, 'users', user.uid, 'favorites', String(movie.id))).catch(() => ({ exists: () => false })) as any;
          }
          const favStatus = favSnap.exists();
          setIsFavorite(favStatus);
          
          const watchedRef = doc(db, 'users', user.uid, 'movieActions', `watched_${movie.id}`);
          let watchedSnap = await getDoc(watchedRef);
          if (!watchedSnap.exists()) {
             watchedSnap = await getDoc(doc(db, 'users', user.uid, 'watched', String(movie.id))).catch(() => ({ exists: () => false })) as any;
          }
          const watchStatus = watchedSnap.exists();
          setIsWatched(watchStatus);
          
          sessionStorage.setItem(cacheKey, JSON.stringify({ isFavorite: favStatus, isWatched: watchStatus }));
        } catch (error: any) {
          if (error?.code !== 'unavailable' && !String(error).includes('Quota limit exceeded') && !(error?.message || "").includes('Quota limit exceeded')) {
            console.error("Error checking actions", error);
          } else if (String(error).includes('Quota limit exceeded') || (error?.message || "").includes('Quota limit exceeded')) {
            window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
          }
        }
      };
      checkActions();
    }
  }, [user, movie.id, isHovered]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert('Please sign in to save favorites');
    
    const actionId = `favorite_${movie.id}`;
    const ref = doc(db, 'users', user.uid, 'movieActions', actionId);
    const legacyRef = doc(db, 'users', user.uid, 'favorites', String(movie.id));
    
    try {
      if (isFavorite) {
        await deleteDoc(ref).catch(e => handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/movieActions/${actionId}`));
        await deleteDoc(legacyRef).catch(() => {});
        setIsFavorite(false);
      } else {
        await setDoc(ref, {
          userId: user.uid,
          movieId: movie.id,
          actionType: 'favorite',
          movieData: {
            title: movie.title || movie.name || '',
            poster_path: movie.poster_path || '',
            release_date: movie.release_date || movie.first_air_date || '',
            vote_average: movie.vote_average || 0
          },
          createdAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/movieActions/${actionId}`));
        setIsFavorite(true);
        }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.15, zIndex: 50 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-neutral-900 rounded-lg border border-white/10 text-left shadow-xl"
    >
      <div className="absolute top-3 left-3 z-40 flex flex-col gap-2">
        <button 
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) return alert('Please sign in');
            const actionId = `watched_${movie.id}`;
            const ref = doc(db, 'users', user.uid, 'movieActions', actionId);
            if (isWatched) {
              await deleteDoc(ref).catch(() => {});
              setIsWatched(false);
            } else {
              await setDoc(ref, {
                userId: user.uid,
                movieId: movie.id,
                actionType: 'watched',
                movieData: {
                  title: movie.title || movie.name || '',
                  poster_path: movie.poster_path || '',
                  release_date: movie.release_date || movie.first_air_date || '',
                  vote_average: movie.vote_average || 0
                },
                createdAt: serverTimestamp()
              }).catch(() => {});
              setIsWatched(true);
            }
          }}
          className="p-2 rounded-full bg-black/80 hover:bg-[#00e054] transition-colors opacity-0 group-hover:opacity-100 duration-300 cursor-pointer mb-2"
          title={isWatched ? "Remove from Watched" : "Mark as Watched"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWatched ? "#00e054" : "none"} stroke={isWatched ? "#00e054" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button 
          onClick={toggleFavorite}
          className="p-2 rounded-full bg-black/80 hover:bg-[#38bdf8] transition-colors opacity-0 group-hover:opacity-100 duration-300 cursor-pointer mb-2"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#38bdf8] text-[#38bdf8]' : 'text-white'}`} />
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openTrailer(movie.id, movie.media_type || (movie.name && !movie.title ? 'tv' : 'movie'), movie.title || movie.name, movie.release_date || movie.first_air_date);
          }}
          className="p-2 rounded-full bg-black/80 hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100 duration-300 cursor-pointer"
          title="Watch Trailer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>

      <Link to={`/movie/${movie.id}?type=${movie.media_type || (movie.name && !movie.title ? 'tv' : 'movie')}`} className="flex flex-col h-full w-full z-10 cursor-pointer">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-800 rounded-lg">
          {(userRating || !hideGlobalRating) && (
            <div className={`absolute top-2 right-2 z-20 px-1.5 py-0.5 bg-black/80 text-[10px] font-bold rounded flex items-center justify-center gap-1 ${userRating ? 'text-blue-400 border border-blue-400/30' : 'text-[#D4AF37]'}`}>
              {userRating ? (
                <>
                  <Star className="w-2.5 h-2.5 fill-blue-400" />
                  {userRating}/10
                </>
              ) : (
                movie.vote_average?.toFixed(1) || 'N/A'
              )}
            </div>
          )}

          <img 
              src={customPoster || (movie.poster_path || movie.backdrop_path ? getImageUrl(movie.poster_path || movie.backdrop_path, 'w500') : `https://via.placeholder.com/500x750?text=${encodeURIComponent(movie.title || movie.name || 'No Image')}`)} 
              alt={movie.title || movie.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110`}
              onError={(e) => { 
                const fallback = `https://via.placeholder.com/500x750?text=${encodeURIComponent(movie.title || movie.name || 'No Image')}`;
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
          />
          
                    
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-3 bg-neutral-900 flex-grow w-full">
          <div className="text-sm font-bold truncate text-white" title={movie.title || movie.name}>{movie.title || movie.name}</div>
          <div className="text-[10px] text-white/40 uppercase mt-1">
            {(movie.release_date || movie.first_air_date) ? (movie.release_date || movie.first_air_date).split('-')[0] : 'Unknown'}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
