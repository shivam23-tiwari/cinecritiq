import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { fetchFromTmdb, getImageUrl } from "../lib/tmdb";
import {
  Play,
  Star,
  Calendar,
  Clock,
  DollarSign,
  Share2,
  Shuffle,
  Plus,
  Check,
  Heart,
  Eye,
  BookOpen,
  X,
  MoreHorizontal,
  TrendingUp,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MovieCard from "../components/MovieCard";
import ReviewsSection from "../components/ReviewsSection";
import ActorModal from "../components/ActorModal";
import { useAuth } from "../lib/AuthContext";
import { useTrailer } from "../lib/TrailerContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from '../lib/firestore-wrapper';


const getProviderLink = (providerName: string, movieTitle: string, defaultLink: string) => {
  if (!movieTitle) return defaultLink;
  const title = encodeURIComponent(movieTitle);
  const name = providerName.toLowerCase();
  
  if (name.includes('netflix')) return `https://www.netflix.com/search?q=${title}`;
  if (name.includes('amazon') || name.includes('prime')) return `https://www.amazon.com/s?k=${title}&i=instant-video`;
  if (name.includes('youtube')) return `https://www.youtube.com/results?search_query=${title}+movie`;
  if (name.includes('hulu')) return `https://www.hulu.com/search?q=${title}`;
  if (name.includes('disney')) return `https://www.disneyplus.com/search?q=${title}`;
  if (name.includes('apple')) return `https://tv.apple.com/us/search?q=${title}`;
  if (name.includes('max') || name.includes('hbo')) return `https://play.max.com/search?q=${title}`;
  if (name.includes('peacock')) return `https://www.peacocktv.com/watch/search?q=${title}`;
  if (name.includes('paramount')) return `https://www.paramountplus.com/search/?q=${title}`;
  if (name.includes('jio') || name.includes('jiocinema')) return `https://www.jiocinema.com/search?q=${title}`;
  
  return defaultLink;
};

const getProviderLogo = (provider: any) => {
  if (provider.provider_name.toLowerCase().includes('jiocinema')) {
    return "https://images.hindustantimes.com/tech/img/2023/05/17/960x540/JioCinema_logo_1684307525287_1684307525424.jpg";
  }
  return getImageUrl(provider.logo_path, "w200");
};

export default function MovieDetails() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedActor, setSelectedActor] = useState<any>(null);
  const [dynamicTrailerKey, setDynamicTrailerKey] = useState<string | null>(null);
  const [posters, setPosters] = useState<any[]>([]);
    const [directorStats, setDirectorStats] = useState<{count: number, watched: number} | null>(null);

  const { user, customPosters } = useAuth();
  console.log("MovieDetails customPosters:", customPosters, "id:", id);
  const { openTrailer } = useTrailer();

  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const [diaryEntry, setDiaryEntry] = useState("");
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
    const [optimisticPoster, setOptimisticPoster] = useState<string | null>(null);
  
  const getActivePoster = () => {
    if (optimisticPoster === "reset") return null;
    if (optimisticPoster) return optimisticPoster;
    return customPosters?.[id || ""];
  };
  const activePoster = getActivePoster();
  
  useEffect(() => {
    setOptimisticPoster(null);
  }, [customPosters]);
  const [showCustomPosterModal, setShowCustomPosterModal] = useState(false);
  const [customPosterUrlInput, setCustomPosterUrlInput] = useState("");
  
    const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie?.title || movie?.name,
          url: window.location.href
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const type = searchParams.get("type") || "movie";

  useEffect(() => {
    if (movie && videos && !dynamicTrailerKey) {
      const tmdbTrailer = videos.find((v) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube") || videos.find((v) => v.site === "YouTube");
      if (tmdbTrailer?.key) {
        setDynamicTrailerKey(tmdbTrailer.key);
      }
    }
  }, [movie, videos, dynamicTrailerKey]);

  useEffect(() => {
    if (credits?.crew) {
      const director = credits.crew.find((c: any) => c.job === 'Director');
      if (director) {
        fetchFromTmdb(`/person/${director.id}/movie_credits`).then(async (res) => {
          // restored empty but functional
        });
      }
    }
  }, [credits, user]);



  useEffect(() => {
    if (user && id) {
      const fetchUserData = async () => {
        try {
          const cacheKey = `details_${user.uid}_${id}`;
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            setInWatchlist(parsed.inWatchlist);
            setIsWatched(parsed.isWatched);
            setIsFavorite(parsed.isFavorite);
            setUserRating(parsed.rating || 0);
            setDiaryEntry(parsed.diary || "");
            return;
          }

          const watchlistRef = doc(db, 'users', user.uid, 'movieActions', `watchlist_${id}`);
          let watchlistSnap = await getDoc(watchlistRef);
          if (!watchlistSnap.exists()) {
             watchlistSnap = await getDoc(doc(db, 'users', user.uid, 'watchlist', String(id))).catch(() => ({ exists: () => false })) as any;
          }
          const wList = watchlistSnap.exists();
          setInWatchlist(wList);

          const watchedRef = doc(db, 'users', user.uid, 'movieActions', `watched_${id}`);
          let watchedSnap = await getDoc(watchedRef);
          if (!watchedSnap.exists()) {
             watchedSnap = await getDoc(doc(db, 'users', user.uid, 'watched', String(id))).catch(() => ({ exists: () => false })) as any;
          }
          const wStatus = watchedSnap.exists();
          setIsWatched(wStatus);

          const favoriteRef = doc(db, 'users', user.uid, 'movieActions', `favorite_${id}`);
          let favoriteSnap = await getDoc(favoriteRef);
          if (!favoriteSnap.exists()) {
             const favRef2 = doc(db, 'users', user.uid, 'movieActions', `fav_${id}`);
             favoriteSnap = await getDoc(favRef2);
          }
          if (!favoriteSnap.exists()) {
             favoriteSnap = await getDoc(doc(db, 'users', user.uid, 'favorites', String(id))).catch(() => ({ exists: () => false })) as any;
          }
          const fStatus = favoriteSnap.exists();
          setIsFavorite(fStatus);

          const ratingRef = doc(db, 'users', user.uid, 'movieActions', `rating_${id}`);
          let ratingSnap = await getDoc(ratingRef);
          if (!ratingSnap.exists()) {
             ratingSnap = await getDoc(doc(db, 'users', user.uid, 'ratings', String(id))).catch(() => ({ exists: () => false })) as any;
          }
          const rStatus = ratingSnap.exists() ? (ratingSnap.data() as any).rating : 0;
          if (ratingSnap.exists()) {
            setUserRating((ratingSnap.data() as any).rating);
          }

          const diaryRef = doc(db, 'users', user.uid, 'movieActions', `diary_${id}`);
          let diarySnap = await getDoc(diaryRef);
          if (!diarySnap.exists()) {
             diarySnap = await getDoc(doc(db, 'users', user.uid, 'diary', String(id))).catch(() => ({ exists: () => false })) as any;
          }
          const dStatus = diarySnap.exists() ? ((diarySnap.data() as any).entry || (diarySnap.data() as any).text || "") : "";
          if (diarySnap.exists()) {
            setDiaryEntry((diarySnap.data() as any).entry || (diarySnap.data() as any).text || "");
          }
          
          sessionStorage.setItem(cacheKey, JSON.stringify({
            inWatchlist: wList,
            isWatched: wStatus,
            isFavorite: fStatus,
            rating: rStatus,
            diary: dStatus
          }));

        } catch (error: any) {
          if (error?.code !== 'unavailable' && !String(error).includes('Quota limit exceeded') && !(error?.message || "").includes('Quota limit exceeded')) {
            console.error("Error fetching user data:", error);
          } else if (String(error).includes('Quota limit exceeded') || (error?.message || "").includes('Quota limit exceeded')) {
            window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
          }
        }
      };
      fetchUserData();
    } else {
      setInWatchlist(false);
      setIsWatched(false);
      setIsFavorite(false);
      setUserRating(null);
    }
  }, [user, id]);

  const handleAction = async (actionType: 'watchlist' | 'watched' | 'favorite') => {
    if (!user) {
      alert("Please login first");
      return;
    }
    const docRef = doc(db, 'users', user.uid, 'movieActions', `${actionType}_${id}`);
    const legacyRef = doc(db, 'users', user.uid, actionType === 'favorite' ? 'favorites' : actionType, String(id));
    try {
      if (actionType === 'watchlist') {
        if (inWatchlist) {
          await deleteDoc(docRef);
          await deleteDoc(legacyRef).catch(() => {});
        }
        else await setDoc(docRef, { 
          movieId: id, 
          actionType: actionType, 
          userId: user.uid, 
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp(),
          movieData: {
            title: movie?.title || movie?.name || '',
            poster_path: movie?.poster_path || '',
            release_date: movie?.release_date || movie?.first_air_date || '',
            vote_average: movie?.vote_average || 0,
            media_type: type || 'movie'
          }
        });
        setInWatchlist(!inWatchlist);
      } else if (actionType === 'watched') {
        if (isWatched) {
          await deleteDoc(docRef);
          await deleteDoc(legacyRef).catch(() => {});
        }
        else await setDoc(docRef, { 
          movieId: id, 
          actionType: actionType, 
          userId: user.uid, 
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp(),
          movieData: {
            title: movie?.title || movie?.name || '',
            poster_path: movie?.poster_path || '',
            release_date: movie?.release_date || movie?.first_air_date || '',
            vote_average: movie?.vote_average || 0,
            media_type: type || 'movie'
          }
        });
        setIsWatched(!isWatched);
      } else if (actionType === 'favorite') {
        if (isFavorite) {
          await deleteDoc(docRef);
          await deleteDoc(doc(db, 'users', user.uid, 'movieActions', `fav_${id}`));
          await deleteDoc(legacyRef).catch(() => {});
        }
        else await setDoc(docRef, { 
          movieId: id, 
          actionType: actionType, 
          userId: user.uid, 
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp(),
          movieData: {
            title: movie?.title || movie?.name || '',
            poster_path: movie?.poster_path || '',
            release_date: movie?.release_date || movie?.first_air_date || '',
            vote_average: movie?.vote_average || 0,
            media_type: type || 'movie'
          }
        });
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error saving action:", error);
    }
  };

  
  const handleSaveTmdbPoster = async (posterPath: string) => {
    console.log("Saving custom poster:", posterPath, id, user?.uid);
    if (!id) return;
    try {
      if (!posterPath) {
        setOptimisticPoster("reset");
        if (user) {
          const actionRef = doc(db, 'users', user.uid, 'movieActions', `customPoster_${id}`);
          await deleteDoc(actionRef);
        } else {
          const localPosters = JSON.parse(localStorage.getItem('customPosters') || '{}');
          delete localPosters[id];
          localStorage.setItem('customPosters', JSON.stringify(localPosters));
          window.dispatchEvent(new Event('localPostersChanged'));
        }
        console.log("Deleted custom poster");
      } else {
        const fullUrl = getImageUrl(posterPath, "w500");
        setOptimisticPoster(fullUrl);
        console.log("Full URL:", fullUrl);
        if (user) {
          const actionRef = doc(db, 'users', user.uid, 'movieActions', `customPoster_${id}`);
          await setDoc(actionRef, { 
            movieId: id,
            actionType: 'customPoster', 
            url: fullUrl,
            customPosterUrl: fullUrl,
            userId: user.uid, 
            createdAt: serverTimestamp(),
            movieData: {
              id: id,
              title: movie?.title || movie?.name || '',
              poster_path: movie?.poster_path || '',
              backdrop_path: movie?.backdrop_path || ''
            }
          });
        } else {
          const localPosters = JSON.parse(localStorage.getItem('customPosters') || '{}');
          localPosters[id] = fullUrl;
          localStorage.setItem('customPosters', JSON.stringify(localPosters));
          window.dispatchEvent(new Event('localPostersChanged'));
        }
        console.log("Saved custom poster successfully");
      }
      setShowCustomPosterModal(false);
    } catch (error: any) {
      console.error("Error saving custom poster:", error);
      alert("Failed to save custom poster: " + error.message);
    }
  };

const handleRating = async (rating: number) => {
    if (!user) {
      alert("Please login first");
      return;
    }
    try {
      const docRef = doc(db, 'users', user.uid, 'movieActions', `rating_${id}`);
      const legacyRef = doc(db, 'users', user.uid, 'ratings', String(id));
      if (rating === userRating) {
        await deleteDoc(docRef);
        await deleteDoc(legacyRef).catch(() => {});
        setUserRating(null);
      } else {
        await setDoc(docRef, { 
        movieId: id, 
        actionType: 'rated',
        rating, 
        userId: user.uid, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp(),
        movieData: {
          title: movie?.title || movie?.name || '',
          poster_path: movie?.poster_path || '',
          release_date: movie?.release_date || movie?.first_air_date || '',
          vote_average: movie?.vote_average || 0,
          media_type: type || 'movie'
        }
      });
        setUserRating(rating);
      }
      setShowRatingModal(false);
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  const saveDiary = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'movieActions', `diary_${id}`);
      const legacyRef = doc(db, 'users', user.uid, 'diary', String(id));
      if (!diaryEntry.trim()) {
         await deleteDoc(docRef);
         await deleteDoc(legacyRef).catch(() => {});
      } else {
        await setDoc(docRef, { 
          movieId: id, 
          actionType: 'diary',
          entry: diaryEntry, 
          userId: user.uid, 
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp(),
          movieData: {
            title: movie?.title || movie?.name || '',
            poster_path: movie?.poster_path || '',
            release_date: movie?.release_date || movie?.first_air_date || '',
            vote_average: movie?.vote_average || 0,
            media_type: type || 'movie'
          }
        });
      }
      setShowDiaryModal(false);
    } catch (error) {
      console.error("Error saving diary:", error);
    }
  };

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const [movieData, creditsData, similarData, videosData, providersData, imagesData] =
          await Promise.all([
            fetchFromTmdb(`/${type}/${id}`),
            fetchFromTmdb(`/${type}/${id}/credits`),
            fetchFromTmdb(`/${type}/${id}/similar`),
            fetchFromTmdb(`/${type}/${id}/videos`),
            fetchFromTmdb(`/${type}/${id}/watch/providers`),
            fetchFromTmdb(`/${type}/${id}/images`, { include_image_language: 'en,null,ja,zh,ko,ru,vi,hi,ar,fa,es,fr,de,it,pt' }),
          ]);

        setMovie(movieData);
        setCredits(creditsData);
        setSimilar(similarData.results || []);
        setVideos(videosData.results || []);
        
        let allFetchedPosters = [...(imagesData?.posters || []), ...(imagesData?.backdrops || [])];
                // Ensure unique
        allFetchedPosters = allFetchedPosters.filter((p, index, self) => index === self.findIndex((t) => t.file_path === p.file_path));
        
        setPosters(allFetchedPosters);

        setProviders(
          providersData?.results?.IN ||
            providersData?.results?.US ||
            providersData?.results?.CA ||
            providersData?.results?.GB ||
            null
        );
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

    const tmdbTrailer = videos.find((v) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube") || videos.find((v) => v.site === "YouTube");
  const explicitVideo = searchParams.get("v");
  const trailerKey = explicitVideo || dynamicTrailerKey || tmdbTrailer?.key;
  

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#050505] animate-pulse">
        <div className="w-full pt-16 md:pt-24 pb-8 bg-white/5 w-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            <div className="w-48 lg:w-72 h-[300px] lg:h-[432px] bg-white/10 rounded-xl flex-shrink-0"></div>
            <div className="flex-1 mt-10 md:mt-0">
              <div className="h-10 bg-white/10 w-3/4 mb-4 rounded"></div>
              <div className="h-4 bg-white/10 w-1/2 mb-8 rounded"></div>
              <div className="space-y-2 mb-8">
                <div className="h-4 bg-white/10 w-full rounded"></div>
                <div className="h-4 bg-white/10 w-full rounded"></div>
                <div className="h-4 bg-white/10 w-2/3 rounded"></div>
              </div>
            </div>
          </div>
      </div>

      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxImage(null)}>
          <button onClick={() => setLightboxImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50">
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img 
              src={lightboxImage} 
              className="max-w-full max-h-full object-contain" 
              alt="Full Size" 
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
            
            {lightboxIndex > 0 && (
              <button 
                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                onClick={(e) => {
                   e.stopPropagation();
                   const allPosters = posters.filter((p: any) => p.file_path !== movie.poster_path).filter((p: any, index: number, self: any[]) => index === self.findIndex((t) => t.file_path === p.file_path));
                   const prev = allPosters[lightboxIndex - 1];
                   if (prev) {
                     setLightboxImage(getImageUrl(prev.file_path, "original") || null);
                     setLightboxIndex(lightboxIndex - 1);
                   }
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            
            {posters.filter((p: any) => p.file_path !== movie.poster_path).filter((p: any, index: number, self: any[]) => index === self.findIndex((t) => t.file_path === p.file_path)).length > lightboxIndex + 1 && (
              <button 
                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                onClick={(e) => {
                   e.stopPropagation();
                   const allPosters = posters.filter((p: any) => p.file_path !== movie.poster_path).filter((p: any, index: number, self: any[]) => index === self.findIndex((t) => t.file_path === p.file_path));
                   const next = allPosters[lightboxIndex + 1];
                   if (next) {
                     setLightboxImage(getImageUrl(next.file_path, "original") || null);
                     setLightboxIndex(lightboxIndex + 1);
                   }
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full flex gap-4 items-center" onClick={(e) => e.stopPropagation()}>
               <button 
                 onClick={() => {
                    const allPosters = posters.filter((p: any) => p.file_path !== movie.poster_path).filter((p: any, index: number, self: any[]) => index === self.findIndex((t) => t.file_path === p.file_path));
                    const current = allPosters[lightboxIndex];
                    if (current) handleSaveTmdbPoster(current.file_path);
                 }}
                 className="flex items-center gap-2 text-white hover:text-[#38bdf8] font-bold text-sm transition-colors"
               >
                 <Check className="w-4 h-4" />
                 Set as Main Poster
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  if (!movie)
    return (
      <div className="text-center py-20 text-xl text-white">
        Movie not found.
      </div>
    );


  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : (movie.first_air_date ? movie.first_air_date.split('-')[0] : '');
  
    const director = credits?.crew?.find((c: any) => c.job === 'Director');
  const directorName = director ? director.name : '';

  const formatStat = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  

  return (
    <div className="w-full pb-20">
      {/* Backdrop Section */}
      <section className="relative w-full pt-16 md:pt-24 pb-8 w-full overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {movie.backdrop_path && (
            <img referrerPolicy="no-referrer"
              src={getImageUrl(movie.backdrop_path, "w1280")}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(229,9,20,0.15),_transparent_60%)]" />
        </div>
          <div className="relative z-10 h-full min-h-[50vh] md:min-h-[80vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center pt-4 md:pt-32 pb-8">
            <div className="block md:flex gap-4 md:gap-8 items-start md:items-start justify-between md:justify-start after:content-[''] after:table after:clear-both">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col w-28 md:w-48 lg:w-[17rem] flex-shrink-0 relative group float-right md:float-none ml-4 mb-2 md:ml-0 md:mb-0"
              >
                <div 
                  className="rounded-t-xl overflow-hidden shadow-2xl border border-white/10 relative cursor-pointer group"
                  onClick={() => setShowCustomPosterModal(true)}
                >
                  <img referrerPolicy="no-referrer"
                    src={activePoster || (movie.poster_path ? getImageUrl(movie.poster_path, "w500") : `https://via.placeholder.com/500x750?text=${encodeURIComponent(movie.title || movie.name || 'No Image')}`)}
                    alt={movie.title}
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white text-xs font-bold bg-black/80 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">Change Poster</span>
                  </div>

                  
                  
                </div>
                {/* Action Bar */}
                <div className="relative rounded-b-xl" ref={moreMenuRef}>
                  <div className="flex bg-[#2c3440] rounded-b-xl overflow-hidden border border-t-0 border-white/10 shadow-2xl">
                    <button onClick={() => handleAction('watched')} className={`flex-1 py-3 flex items-center justify-center transition-colors ${isWatched ? 'bg-[#299555] text-[#00e054]' : 'hover:bg-white/10 text-[#8aa8cc]'} border-r border-[#14181c]`}> 
                      <Eye className={`w-5 h-5 ${isWatched ? 'fill-[#00e054]' : ''}`} />
                    </button>
                    <button onClick={() => handleAction('favorite')} className={`flex-1 py-3 flex items-center justify-center transition-colors ${isFavorite ? 'bg-[#995224] text-orange-400' : 'hover:bg-white/10 text-[#8aa8cc]'} border-r border-[#14181c]`}> 
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-orange-400' : ''}`} />
                    </button>
                    <button onClick={() => setShowRatingModal(true)} className={`flex-1 py-3 flex items-center justify-center hover:bg-white/10 transition-colors border-r border-[#14181c] ${userRating ? 'text-[#D4AF37]' : 'text-[#8aa8cc]'}`}> 
                      <Star className={`w-5 h-5 ${userRating ? 'fill-[#D4AF37]' : ''}`} />
                    </button>
                    <button onClick={() => setShowMoreMenu(!showMoreMenu)} className={`flex-1 py-3 flex items-center justify-center hover:bg-white/10 transition-colors relative ${showMoreMenu ? 'text-white bg-white/10' : 'text-[#8aa8cc]'}`}> 
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showMoreMenu && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-[#2c3440] rounded-lg shadow-2xl border border-white/10 z-50 overflow-hidden flex flex-col py-1">
                      <button onClick={handleShare} className="w-full px-4 py-2 text-left text-sm text-[#8aa8cc] hover:text-white hover:bg-white/10 flex items-center gap-3">
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                  )}
                </div>
                
                              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:flex-1 mt-0 md:-mt-2"
              >

                <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white mb-2 md:mb-4 tracking-tight break-words pr-2" style={{ fontFamily: "Inter, sans-serif" }}>
                  {movie.title || movie.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-xl text-gray-300 mb-4 md:mb-6 font-medium">
                  {releaseYear && <Link to={`/films/year/${releaseYear}`} className="border-b-2 border-white/80 pb-0.5 text-white hover:text-[#00e054] hover:border-[#00e054] transition-colors">{releaseYear}</Link>}
                  {directorName && (
                    <span className="text-gray-400">
                      directed by <Link to={`/person/${director.id}`} state={{ activeRole: "Director" }} className="border-b-2 border-white/80 pb-0.5 text-white hover:text-[#00e054] hover:border-[#00e054] transition-colors">{directorName}</Link>
                    </span>
                  )}
                </div>

                {movie.tagline && (
                  <p className="text-[#D4AF37] uppercase tracking-[0.1em] text-xs font-bold mb-6">{movie.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-8 font-medium">
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                      <Star className="w-4 h-4 fill-[#D4AF37]" />
                      {(movie.vote_average).toFixed(1)} <span className="text-gray-400 font-normal">({movie.vote_count ? movie.vote_count.toLocaleString() : 0} reviews)</span>
                    </div>
                  )}
                  {(movie.release_date || movie.first_air_date) && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {movie.release_date || movie.first_air_date}
                    </div>
                  )}
                  {movie.runtime ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {movie.runtime} min
                    </div>
                  ) : movie.episode_run_time?.[0] ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {movie.episode_run_time[0]} min
                    </div>
                  ) : null}
                  
                  {movie.genres && (
                    <div className="flex flex-wrap gap-2 ml-2">
                      {movie.genres.map((genre: any) => (
                        <span key={genre.id} className="bg-white/10 hover:bg-white/20 transition-colors text-gray-300 px-3 py-1 rounded-md text-xs border border-white/5 font-medium">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="prose prose-invert max-w-3xl mb-8 md:mb-10 text-[#a3a3a3] text-[15px] md:text-lg leading-relaxed">
                  <p className={!showFullOverview ? "line-clamp-4 md:line-clamp-none" : ""}>
                    {movie.overview || "No overview available."}
                  </p>
                  {(movie.overview || "").length > 180 && (
                    <button 
                      onClick={() => setShowFullOverview(!showFullOverview)} 
                      className="text-[#38bdf8] text-[13px] font-bold mt-1 md:hidden hover:underline"
                    >
                      {showFullOverview ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>

                {/* Buttons block */}
                <div className="flex flex-col gap-5 mt-6">
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <button
                        onClick={() => openTrailer(movie.id, type as "movie" | "tv", movie.title || movie.name, movie.release_date || movie.first_air_date, trailerKey)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-[#38bdf8] hover:bg-[#0284c7] rounded font-bold transition-colors text-white text-[13px] md:text-[15px] min-w-[140px]"
                      >
                        <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Watch Trailer
                      </button>
                    <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-[#2c2c2c] hover:bg-[#3c3c3c] rounded font-bold transition-colors border border-white/10 text-white text-[13px] md:text-[15px] min-w-[120px]">
                      <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Share
                    </button>
                  </div>
                  
                  {/* Actions Grid */}
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <button 
                      onClick={() => handleAction('watchlist')} 
                      className={`flex-1 sm:flex-none px-3 md:px-5 py-2.5 rounded font-bold transition-colors flex justify-center items-center gap-1.5 md:gap-2 text-[12px] md:text-[14px] min-w-[130px] ${inWatchlist ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                    >
                      {inWatchlist ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      Watchlist
                    </button>
                    <button 
                      onClick={() => handleAction('watched')} 
                      className={`flex-1 sm:flex-none px-3 md:px-5 py-2.5 rounded font-bold transition-colors flex justify-center items-center gap-1.5 md:gap-2 text-[12px] md:text-[14px] min-w-[120px] ${isWatched ? 'bg-[#0a4d2e] border border-transparent text-[#00e054] hover:bg-[#0c613a]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                    >
                      {isWatched ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      Watched
                    </button>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowRatingModal(true)} 
                        className={`w-10 h-10 md:w-11 md:h-11 rounded-full transition-all flex items-center justify-center shrink-0 ${userRating ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                        title="Rate"
                      >
                        <Star className={`w-4 h-4 md:w-4 md:h-4 ${userRating ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={() => setShowDiaryModal(true)} 
                        className={`w-10 h-10 md:w-11 md:h-11 rounded-full transition-all flex items-center justify-center shrink-0 ${diaryEntry ? 'bg-[#2c2c2c] border border-purple-500/50 text-purple-400 hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                        title="Log to Diary"
                      >
                        <BookOpen className="w-4 h-4 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                  

                </div>
              </motion.div>
            </div>
          </div>
      </section>


      {/* Where to Watch Section */}
      {providers && (providers.flatrate || providers.rent || providers.buy) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-16 pb-8 border-t border-white/5 mt-2 md:mt-8">
          <h2 className="text-lg md:text-xl font-bold text-white mb-6 md:mb-8">Where to Watch</h2>
          
          <div className="space-y-8 md:space-y-10">
            {providers.flatrate && (
              <div>
                <h3 className="text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-4">STREAM</h3>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  {providers.flatrate.map((provider: any) => (
                    <a key={provider.provider_id} href={getProviderLink(provider.provider_name, movie.title || movie.name, providers?.link)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 w-16 md:w-20 group hover:scale-105 transition-transform">
                      <img src={getProviderLogo(provider)} alt={provider.provider_name} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-md" title={provider.provider_name} />
                      <span className="text-[10px] md:text-[11px] text-gray-400 text-center truncate w-full group-hover:text-white transition-colors">{provider.provider_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {providers.rent && (
              <div>
                <h3 className="text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-4">RENT</h3>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  {providers.rent.map((provider: any) => (
                    <a key={provider.provider_id} href={getProviderLink(provider.provider_name, movie.title || movie.name, providers?.link)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 w-16 md:w-20 group hover:scale-105 transition-transform">
                      <img src={getProviderLogo(provider)} alt={provider.provider_name} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-md" title={provider.provider_name} />
                      <span className="text-[10px] md:text-[11px] text-gray-400 text-center truncate w-full group-hover:text-white transition-colors">{provider.provider_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {providers.buy && (
              <div>
                <h3 className="text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-4">BUY</h3>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  {providers.buy.map((provider: any) => (
                    <a key={provider.provider_id} href={getProviderLink(provider.provider_name, movie.title || movie.name, providers?.link)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 w-16 md:w-20 group hover:scale-105 transition-transform">
                      <img src={getProviderLogo(provider)} alt={provider.provider_name} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-md" title={provider.provider_name} />
                      <span className="text-[10px] md:text-[11px] text-gray-400 text-center truncate w-full group-hover:text-white transition-colors">{provider.provider_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-12 text-sm text-gray-600">
            Powered by JustWatch
          </div>
        </section>
      )}

      {/* Cast Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-lg font-semibold text-white mb-6">Top Cast</h2>
        <div className="flex overflow-x-auto gap-3 md:gap-5 pb-4 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
          {credits?.cast && credits.cast.length > 0 ? (
            credits.cast
              .slice(0, 15)
              .map((actor: any) => (
                <Link key={actor.id} to={`/person/${actor.id}`} state={{ activeRole: "Actor" }} className="flex flex-col items-start gap-2 p-0 rounded-none bg-transparent border-transparent hover:border-transparent hover:bg-transparent transition-colors cursor-pointer group w-[100px] sm:w-[120px] md:w-[150px] shrink-0 snap-start">
                  <div className="w-full h-[150px] sm:h-[180px] md:h-[225px] shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative">
                    {actor.profile_path ? (
                      <img referrerPolicy="no-referrer"
                        src={getImageUrl(actor.profile_path, "w500")}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center p-1 bg-neutral-900 ${actor.profile_path ? 'hidden' : ''}`}>
                       <span className="font-bold text-white/50 text-[8px] uppercase">{actor.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="w-full">
                    <h4 className="text-white font-medium text-xs md:text-sm group-hover:text-[#38bdf8] transition-colors truncate">
                      {actor.name}
                    </h4>
                    <p className="text-gray-500 text-[10px] md:text-xs mt-0.5 truncate">
                      {actor.character}
                    </p>
                  </div>
                </Link>
              ))
          ) : (
            <div className="text-gray-500 text-sm py-4">
              No cast information available for this movie.
            </div>
          )}
        </div>
      </section>

      {/* Production Info */}
      <section className="w-full bg-white/5 py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-10 text-center md:text-left">
            <div className="bg-white/5 p-4 md:p-6 rounded-xl border border-white/10 break-words">
              <p className="text-gray-400 text-sm mb-2">Status</p>
              <p className="text-white font-bold text-lg">{movie.status}</p>
              {movie.release_date && (
                <p className="text-gray-500 text-xs mt-1">
                  {movie.release_date}
                </p>
              )}
            </div>
            <div className="bg-white/5 p-4 md:p-6 rounded-xl border border-white/10 break-words">
              <p className="text-gray-400 text-sm mb-2 flex items-center justify-center md:justify-start gap-1">
                <DollarSign className="w-4 h-4" /> Production Budget
              </p>
              <p className="text-white font-bold text-lg">
                {movie.budget > 0
                  ? `$${movie.budget.toLocaleString()}`
                  : "Not Available"}
              </p>
              <p className="text-gray-500 text-xs mt-1">Estimated Cost</p>
            </div>
            
            <div className="bg-[#38bdf8]/10 p-4 md:p-6 rounded-xl border border-[#38bdf8]/20 break-words">
              <p className="text-[#ff4c55] text-sm mb-2 flex items-center justify-center md:justify-start gap-1">
                <TrendingUp className="w-4 h-4" /> Global Revenue
              </p>
              <p className="text-[#38bdf8] font-bold text-lg">
                {movie.revenue > 0
                  ? `$${movie.revenue.toLocaleString()}`
                  : "Not Available"}
              </p>
              <p className="text-[#38bdf8]/60 text-xs mt-1">Worldwide Box Office</p>
            </div>
            
            {type !== 'movie' && (
              <>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <p className="text-gray-400 text-sm mb-2 flex items-center justify-center md:justify-start gap-1">
                    <Calendar className="w-4 h-4" /> Seasons
                  </p>
                  <p className="text-white font-bold text-lg">
                    {movie.number_of_seasons || "N/A"}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Total Seasons</p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <p className="text-gray-400 text-sm mb-2 flex items-center justify-center md:justify-start gap-1">
                    <TrendingUp className="w-4 h-4" /> Episodes
                  </p>
                  <p className="text-white font-bold text-lg">
                    {movie.number_of_episodes || "N/A"}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Total Episodes</p>
                </div>
              </>
            )}

            <div className="bg-[#38bdf8]/10 p-6 rounded-xl border border-[#38bdf8]/20">
              <p className="text-[#38bdf8] text-sm mb-2 flex items-center justify-center md:justify-start gap-1">
                <DollarSign className="w-4 h-4" /> Global Revenue
              </p>
              <p className="text-white font-bold text-lg">
                {movie.revenue > 0
                  ? `${movie.revenue.toLocaleString()}`
                  : "Not Available"}
              </p>
              <p className="text-[#38bdf8]/60 text-xs mt-1">Box Office Total</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-400 text-sm mb-2">Original Language</p>
              <p className="text-white font-bold text-lg uppercase">
                {movie.original_language}
              </p>
              <p className="text-gray-500 text-xs mt-1">Spoken Language</p>
            </div>
          </div>

          {movie.production_companies &&
            movie.production_companies.length > 0 && (
              <div className="mt-8">
                <p className="text-gray-400 text-sm mb-4">
                  Production Companies
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  {movie.production_companies.map((company: any) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg border border-white/10"
                    >
                      {company.logo_path ? (
                        <img referrerPolicy="no-referrer"
                          src={getImageUrl(company.logo_path, "w500")}
                          alt={company.name}
                          className="h-6 object-contain filter invert"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {company.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>

      {/* Global Platform Ratings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <h2 className="text-xl font-bold text-white mb-6">Global Audience Ratings & Rankings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TMDB Real Rating */}
          <div className="bg-[#0d253f] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#01b4e4]/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-[#01b4e4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <img referrerPolicy="no-referrer" src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" className="h-4 mb-5 relative z-10" />
            <div className="text-3xl font-black text-white relative z-10 flex items-center gap-1">
              {movie?.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} <Star className="w-5 h-5 fill-[#01b4e4] text-[#01b4e4]" />
            </div>
            <div className="text-gray-400 text-sm mt-1 relative z-10 font-medium">Average Global Rating</div>
            <div className="mt-4 pt-4 border-t border-white/10 w-full text-center relative z-10">
              <span className="text-[#01b4e4] font-bold">
                {movie?.vote_count ? new Intl.NumberFormat('en-IN').format(movie.vote_count) : 0}
              </span> <span className="text-xs text-gray-500 uppercase tracking-widest">Real Reviews</span>
            </div>
          </div>

          {/* Runtime & Language */}
          <div className="bg-[#1d1d1f] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/30 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-sm text-white font-bold tracking-widest uppercase mb-4 relative z-10">Global Reach</div>
            <div className="text-3xl font-black text-white relative z-10 flex items-center gap-2">
              {movie?.original_language ? movie.original_language.toUpperCase() : 'EN'}
            </div>
            <div className="text-gray-400 text-sm mt-1 relative z-10 font-medium">Original Language</div>
            <div className="mt-4 pt-4 border-t border-white/10 w-full text-center relative z-10">
              <span className="text-white font-bold">{movie?.production_countries?.length || 1}</span> <span className="text-xs text-gray-500 uppercase tracking-widest">Countries Produced In</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trailers & Videos */}
      {videos.filter((v) => v.site === "YouTube").length > 0 && (
        <section id="trailers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <h2 className="text-xl font-semibold text-white mb-8">Trailers & Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.filter((v) => v.site === "YouTube").map((video) => (
              <div 
                key={video.id} 
                className="bg-black rounded-lg overflow-hidden border border-white/10 flex flex-col group cursor-pointer"
                onClick={() => openTrailer(movie.id, type as "movie" | "tv", movie.title || movie.name, movie.release_date || movie.first_air_date, video.key)}
              >
                 <div className="aspect-video relative w-full overflow-hidden">
                   <img referrerPolicy="no-referrer" 
                     src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                     alt={video.name}
                     onError={(e) => {
                       e.currentTarget.src = `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
                     }}
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-100"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center group-hover:bg-[#38bdf8] group-hover:border-[#38bdf8] transition-colors">
                       <Play className="w-5 h-5 fill-white text-white ml-1" />
                     </div>
                   </div>
                 </div>
                 <div className="p-4 bg-[#1a1c1d]">
                   <h3 className="text-sm font-medium text-white line-clamp-1">{video.name}</h3>
                   <p className="text-xs text-gray-400 mt-1">{video.type}</p>
                 </div>
              </div>
            ))}
          </div>
        </section>
      )}

      
\n      {/* Similar Movies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8 border-t border-white/5">
        <ReviewsSection movieId={parseInt(id!)} isReleased={(movie.release_date || movie.first_air_date) ? new Date(movie.release_date || movie.first_air_date) <= new Date() : false} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-lg font-semibold text-white mb-6">
          Because you watched {movie.title || movie.name}
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {similar.slice(0, 10).map((m: any, idx: number) => (
            <MovieCard key={`${m.id}-${idx}`} movie={m} />
          ))}
        </div>
      </section>

      {/* Actor Details Modal */}
      {selectedActor && (
        <ActorModal
          actor={selectedActor}
          onClose={() => setSelectedActor(null)}
        />
      )}

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }}
              className="bg-[#141414] border border-white/10 p-6 rounded-xl w-full max-w-sm relative"
            >
              <button 
                onClick={() => setShowRatingModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-4 text-center">Rate {movie.title || movie.name}</h3>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                  <button 
                    key={star}
                    onClick={() => handleRating(star)}
                    className="group"
                  >
                    <Star className={`w-6 h-6 ${userRating && userRating >= star ? 'fill-blue-500 text-blue-500' : 'text-gray-600 group-hover:text-blue-400'}`} />
                  </button>
                ))}
              </div>
              {userRating && (
                <button 
                  onClick={() => {
                    const actionId = `rated_${movie.id}`;
                    deleteDoc(doc(db, 'users', user!.uid, 'movieActions', actionId));
                    setUserRating(null);
                    setShowRatingModal(false);
                  }}
                  className="w-full py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Remove Rating
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      

      {/* Diary Modal */}
      <AnimatePresence>
        {showDiaryModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }}
              className="bg-[#141414] border border-white/10 p-6 rounded-xl w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowDiaryModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-4">Diary Entry for {movie.title || movie.name}</h3>
              <textarea 
                value={diaryEntry}
                onChange={(e) => setDiaryEntry(e.target.value)}
                placeholder="Write your thoughts..."
                className="w-full h-32 bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none mb-4 resize-none"
              ></textarea>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowDiaryModal(false)}
                  className="px-4 py-2 rounded-lg text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveDiary}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
    

      {/* Custom Poster Modal */}
      <AnimatePresence>
        {showCustomPosterModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }}
              className="bg-[#141414] border border-white/10 p-6 rounded-xl w-full max-w-2xl relative max-h-[80vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowCustomPosterModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Change Poster</h3>
                  <p className="text-sm text-white/60">Select a poster or paste a custom image URL.</p>
                </div>
                {activePoster && (
                  <button
                    onClick={() => handleSaveTmdbPoster("")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>

              <div className="mb-6 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Paste a custom image URL (http...)" 
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#38bdf8]"
                  value={customPosterUrlInput}
                  onChange={(e) => setCustomPosterUrlInput(e.target.value)}
                />
                <button 
                  onClick={() => {
                    if (customPosterUrlInput) {
                      handleSaveTmdbPoster(customPosterUrlInput);
                      setCustomPosterUrlInput("");
                    }
                  }}
                  className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Save URL
                </button>
              </div>

              

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                <div 
                  className={`aspect-[2/3] rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 relative group ${!activePoster ? 'border-[#38bdf8]' : 'border-transparent hover:border-white/50'}`}
                  onClick={() => handleSaveTmdbPoster("")}
                >
                  <img referrerPolicy="no-referrer" src={getImageUrl(movie.poster_path, "w500")} className="w-full h-full object-cover" alt="Default" />
                  {!activePoster && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-bold text-white">Current</span>
                    </div>
                  )}
                </div>
                {posters
                  .filter((p: any) => p.file_path !== movie.poster_path)
                  .sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))
                  .filter((p: any, index: number, self: any[]) => index === self.findIndex((t) => t.file_path === p.file_path))
                  
                  .map((poster: any, idx: number, arr: any[]) => {
                    const posterUrl = getImageUrl(poster.file_path, "w500");
                    const isCurrent = activePoster === posterUrl;
                    return (
                      <div 
                        key={poster.file_path}
                        className={`${poster.aspect_ratio && poster.aspect_ratio > 1 ? 'aspect-video' : 'aspect-[2/3]'} rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 relative group ${isCurrent ? 'border-[#38bdf8]' : 'border-transparent hover:border-white/50'}`}
                        onClick={() => { setLightboxImage(getImageUrl(poster.file_path, "original") || null); setLightboxIndex(idx); }}
                      >
                        <img referrerPolicy="no-referrer" src={posterUrl} className="w-full h-full object-cover" alt="Gallery Image" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center pointer-events-none transition-opacity">
                          <Maximize2 className="w-8 h-8 text-white mb-2" />
                        </div>
                        {isCurrent && (
                          <div className="absolute top-2 left-2 bg-[#38bdf8] text-black text-[10px] font-bold px-2 py-1 rounded shadow pointer-events-none">
                            CURRENT
                          </div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSaveTmdbPoster(poster.file_path); }} 
                          className="absolute bottom-2 right-2 bg-black/80 hover:bg-[#38bdf8] hover:text-black text-white p-2 rounded-full transition-colors z-10"
                          title="Set as Main Poster"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
</div>
  );
}