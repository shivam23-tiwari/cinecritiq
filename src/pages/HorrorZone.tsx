import { useState, useEffect } from "react";
import { fetchFromTmdb } from "../lib/tmdb";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";

let cachedMovies: any[] = [];
let cachedShows: any[] = [];
let cachedThrillers: any[] = [];
let cachedSlashers: any[] = [];


export default function HorrorZone() {
  

  const [movies, setMovies] = useState<any[]>(cachedMovies);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchHorrorMovies = async (bg = false) => {
      if (!bg) setLoading(true);
      try {
        // Fetch first page immediately to show content fast
        const res1 = await fetchFromTmdb("/discover/movie", {
          with_genres: "27",
          sort_by: "popularity.desc",
          page: "1",
          include_adult: "false",
        });

        if (!mounted) return;
        let initialMovies = res1?.results || [];
        setMovies((prev) => (bg ? prev : initialMovies)); cachedMovies = (bg ? cachedMovies : initialMovies);
        if (!bg) setLoading(false); // Stop loader quickly

        // Fetch remaining pages in background
        const [res2, res3, res4, res5] = await Promise.all([
          fetchFromTmdb("/discover/movie", {
            with_genres: "27",
            sort_by: "popularity.desc",
            page: "2",
            include_adult: "false",
          }),
          fetchFromTmdb("/discover/movie", {
            with_genres: "27",
            sort_by: "popularity.desc",
            page: "3",
            include_adult: "false",
          }),
          fetchFromTmdb("/discover/movie", {
            with_genres: "27",
            sort_by: "popularity.desc",
            page: "4",
            include_adult: "false",
          }),
          fetchFromTmdb("/discover/movie", {
            with_genres: "27",
            sort_by: "popularity.desc",
            page: "5",
            include_adult: "false",
          }),
        ]);

        if (!mounted) return;

        const combined = [
          ...initialMovies,
          ...(res2?.results || []),
          ...(res3?.results || []),
          ...(res4?.results || []),
          ...(res5?.results || []),
        ];
        const uniqueIds = new Set();
        const filtered = combined.filter((m: any) => {
          if (uniqueIds.has(m.id)) return false;
          uniqueIds.add(m.id);
          return true;
        });
        setMovies(filtered.slice(0, 100)); cachedMovies = filtered.slice(0, 100);
      } catch (err) {
        console.error(err);
        if (!bg) setLoading(false);
      }
    };

    fetchHorrorMovies();
    const interval = setInterval(() => fetchHorrorMovies(true), 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen pt-24 px-6 md:px-10 bg-gradient-to-b from-black via-black/90 to-[#1a0000]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-lg mb-4">
            CINE<span className="text-[#8B0000]">HORROR</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Experience the best and most terrifying movies. Not for the faint of
            heart.
          </p>
        </div>

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
          <div className="py-10 text-center text-white/50">
            No movies found.
          </div>
        )}
      </div>
    </div>
  );
}
