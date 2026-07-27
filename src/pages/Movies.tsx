import { useState, useEffect } from "react";
import { fetchFromTmdb, getImageUrl } from "../lib/tmdb";
import MovieCard from "../components/MovieCard";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useTrailer } from "../lib/TrailerContext";
import { Play } from "lucide-react";

let cachedPopular: any[] = [];
let cachedUpcoming: any[] = [];
let cachedAction: any[] = [];
let cachedComedy: any[] = [];
let cachedHorror: any[] = [];
let cachedRomance: any[] = [];


export default function Movies() {
  

  const { openTrailer } = useTrailer();
  const [heroIndex, setHeroIndex] = useState(0);
  const [popular, setPopular] = useState<any[]>(cachedPopular);
  const [upcoming, setUpcoming] = useState<any[]>(cachedUpcoming);
  const [action, setAction] = useState<any[]>(cachedAction);
  const [comedy, setComedy] = useState<any[]>(cachedComedy);
  const [horror, setHorror] = useState<any[]>(cachedHorror);
  const [romance, setRomance] = useState<any[]>(cachedRomance);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [
          pop1, pop2,
          up1, up2,
          act1, act2,
          com1, com2,
          hor1, hor2,
          rom1, rom2
        ] = await Promise.all([
          fetchFromTmdb("/movie/popular", { page: "1" }),
          fetchFromTmdb("/movie/popular", { page: "2" }),
          fetchFromTmdb("/movie/upcoming", { page: "1" }),
          fetchFromTmdb("/movie/upcoming", { page: "2" }),
          fetchFromTmdb("/discover/movie", { with_genres: "28", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_genres: "28", page: "2" }),
          fetchFromTmdb("/discover/movie", { with_genres: "35", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_genres: "35", page: "2" }),
          fetchFromTmdb("/discover/movie", { with_genres: "27", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_genres: "27", page: "2" }),
          fetchFromTmdb("/discover/movie", { with_genres: "10749", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_genres: "10749", page: "2" }),
        ]);

        if (!mounted) return;

        const combine = (...responses: any[]) => {
          const all = responses.flatMap((r) => r?.results || []);
          const unique = new Map(all.map((item) => [item.id, item]));
          return Array.from(unique.values());
        };

        const today = new Date().toISOString().split('T')[0];
        setPopular(combine(pop1, pop2)); cachedPopular = combine(pop1, pop2);
        setUpcoming(combine(up1, up2).filter((movie: any) => movie.release_date)); cachedUpcoming = combine(up1, up2).filter((movie: any) => movie.release_date);
        setAction(combine(act1, act2)); cachedAction = combine(act1, act2);
        setComedy(combine(com1, com2)); cachedComedy = combine(com1, com2);
        setHorror(combine(hor1, hor2)); cachedHorror = combine(hor1, hor2);
        setRomance(combine(rom1, rom2)); cachedRomance = combine(rom1, rom2);
      } catch (error) {
        console.error("Failed to fetch movies data:", error);
      }
    };
    
    fetchData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (popular.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 5);
    }, 8000);
    return () => clearInterval(interval);
  }, [popular]);

  const heroMovie = popular[heroIndex];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden">
        {heroMovie && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.img
                key={`hero-${heroMovie.id}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={getImageUrl(heroMovie.backdrop_path, "w1280")}
                alt={heroMovie.title}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
          </div>
        )}

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-24 md:pb-32">
          {heroMovie && (
            <motion.div
              key={`info-${heroMovie.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-3xl"
            >
              <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-tight text-white drop-shadow-lg">
                {heroMovie.title || heroMovie.name}
              </h1>
              <p className="text-white/60 text-sm md:text-lg mb-8 line-clamp-3 leading-relaxed">
                {heroMovie.overview}
              </p>
              <div className="flex gap-4">
                <button onClick={() => openTrailer(heroMovie.id, "movie", heroMovie.title || heroMovie.name, heroMovie.release_date || heroMovie.first_air_date)} className="px-6 py-2.5 text-sm bg-[#38bdf8] hover:bg-[#0284c7] rounded-md font-bold flex items-center gap-2 transition-colors text-white">
                  <Play className="w-5 h-5 fill-current" /> Watch Now
                </button>
                <Link
                  to={`/movie/${heroMovie.id}?type=movie`}
                  className="px-6 py-2.5 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-md font-bold transition-colors text-white"
                >
                  More Info
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Popular Movies */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Popular Movies</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {popular.slice(0, 30).map((movie, idx) => (
              <div key={`pop-${movie.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...movie, media_type: 'movie' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Movies */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Movies</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {upcoming.slice(0, 30).map((movie, idx) => (
              <div key={`up-${movie.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...movie, media_type: 'movie' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action Movies */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Action-Packed Movies</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {action.slice(0, 30).map((movie, idx) => (
              <div key={`act-${movie.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...movie, media_type: 'movie' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comedy Movies (Grid) */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Laugh Out Loud - Comedies</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
          {comedy.slice(0, 24).map((movie, idx) => (
            <MovieCard key={`com-${movie.id}-${idx}`} movie={{ ...movie, media_type: 'movie' }} />
          ))}
        </div>
      </section>

      {/* Horror */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Chilling Horror Movies</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {horror.slice(0, 30).map((movie, idx) => (
              <div key={`hor-${movie.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...movie, media_type: 'movie' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Romance */}
      <section className="py-12 px-6 md:px-10 relative z-20 bg-gradient-to-t from-pink-950/20 to-transparent">
        <h2 className="text-xl font-semibold text-pink-300 mb-6">Romantic Movies</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {romance.slice(0, 30).map((movie, idx) => (
              <div key={`rom-${movie.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...movie, media_type: 'movie' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
