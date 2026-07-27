const fs = require('fs');

let code = `
import { useState, useEffect } from "react";
import { fetchFromTmdb, getImageUrl } from "../lib/tmdb";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import { motion, AnimatePresence } from "motion/react";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useTrailer } from "../lib/TrailerContext";

let cachedMovies: any[] = [];
let cachedPage: number = 1;
let cachedHasMore: boolean = true;

export default function KidsZone() {
  const { openTrailer } = useTrailer();
  const [movies, setMovies] = useState<any[]>(cachedMovies);
  const [loading, setLoading] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [page, setPage] = useState(cachedPage);
  const [hasMore, setHasMore] = useState(cachedHasMore);

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(5, movies.length));
    }, 8000);
    return () => clearInterval(interval);
  }, [movies]);

  const fetchKidsMovies = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetchFromTmdb("/discover/movie", {
        with_genres: "16,10751",
        sort_by: "popularity.desc",
        page: pageNum.toString(),
        include_adult: "false",
      });

      if (res.results) {
        setMovies((prev) => {
          const newUnique = res.results.filter(
            (a: any) => !prev.some((p) => p.id === a.id)
          );
          const updated = [...prev, ...newUnique];
          cachedMovies = updated;
          return updated;
        });

        const more = pageNum < res.total_pages && pageNum < 100;
        setHasMore(more);
        cachedHasMore = more;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movies.length === 0) {
      fetchKidsMovies(1);
    }
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      cachedPage = nextPage;
      fetchKidsMovies(nextPage);
    }
  };

  const heroMovie = movies.length > 0 ? movies[heroIndex] : null;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden">
        {heroMovie && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.img
                key={heroMovie.id}
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
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(229,9,20,0.15),_transparent_60%)]" />
          </div>
        )}

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-24 md:pb-32">
          {heroMovie && (
            <motion.div
              key={heroMovie.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-3xl"
            >
              <div className="mb-4 inline-block px-3 py-1 bg-[#38bdf8] text-white text-xs font-bold tracking-wider rounded border border-[#38bdf8]/20 uppercase">
                Trending in Kids
              </div>
              <h1 className="text-6xl font-black mb-4 tracking-tight leading-tight text-white drop-shadow-lg">
                {heroMovie.title}
              </h1>
              <p className="text-white/60 text-base md:text-lg mb-8 line-clamp-2 leading-relaxed">
                {heroMovie.overview}
              </p>
              <div className="flex gap-4">
                <button onClick={() => openTrailer(heroMovie.id, "movie", heroMovie.title, heroMovie.release_date)} className="px-6 py-2.5 text-sm bg-[#38bdf8] hover:bg-[#0284c7] rounded-md font-bold flex items-center gap-2 transition-colors text-white">
                  <Play className="w-5 h-5 fill-current" /> Watch Now
                </button>
                <Link
                  to={\`/movie/\${heroMovie.id}\`}
                  className="px-6 py-2.5 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-md font-bold transition-colors text-white"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <div className="min-h-screen pt-12 px-6 md:px-10 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-lg mb-4">
              CINE<span className="text-[#38bdf8]">KIDS</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Discover the best animated and family-friendly movies for everyone
              to enjoy.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
            {movies.map((movie, idx) => (
              <MovieCard key={\`\${movie.id}-\${idx}\`} movie={movie} />
            ))}
          </div>

          {loading && (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 mt-5">
              {[...Array(14)].map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMore}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all"
              >
                Load More Kids Movies
              </button>
            </div>
          )}
          
          {!loading && movies.length === 0 && (
            <div className="py-10 text-center text-white/50">
              No movies found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/KidsZone.tsx', code);
