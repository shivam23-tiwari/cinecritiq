import { useState, useEffect } from "react";
import { fetchFromTmdb } from "../lib/tmdb";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";

export default function Trending() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchTrending = async (bg = false) => {
      if (!bg) setLoading(true);
      try {
        const res1 = await fetchFromTmdb("/trending/movie/day", { page: "1" });
        if (!mounted) return;
        let initialMovies = res1?.results || [];
        setMovies((prev) => (bg ? prev : initialMovies));
        if (!bg) setLoading(false);

        // Fetch remaining pages in background
        const [res2, res3] = await Promise.all([
          fetchFromTmdb("/trending/movie/day", { page: "2" }),
          fetchFromTmdb("/trending/movie/day", { page: "3" }),
        ]);
        if (!mounted) return;

        const combined = [
          ...initialMovies,
          ...(res2?.results || []),
          ...(res3?.results || []),
        ];
        const uniqueIds = new Set();
        const filtered = combined.filter((m: any) => {
          if (uniqueIds.has(m.id)) return false;
          uniqueIds.add(m.id);
          return true;
        });
        setMovies(filtered.slice(0, 50));
      } catch (err) {
        console.error(err);
        if (!bg) setLoading(false);
      }
    };

    fetchTrending();
    const interval = setInterval(() => fetchTrending(true), 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-12">
      <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-lg mb-2">
        <span className="text-[#38bdf8]">TRENDING</span> NOW
      </h1>
      <p className="text-white/60 mb-8 text-lg font-medium">
        The most popular movies updated daily.
      </p>

      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
          {[...Array(12)].map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
          {movies.map((movie, idx) => (
            <MovieCard key={`${movie.id}-${idx}`} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-white/50">No movies found.</div>
      )}
    </div>
  );
}
