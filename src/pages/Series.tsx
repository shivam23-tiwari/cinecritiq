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


export default function Series() {
  

  const { openTrailer } = useTrailer();
  const [heroIndex, setHeroIndex] = useState(0);
  const [popular, setPopular] = useState<any[]>(cachedPopular);
  const [drama, setDrama] = useState<any[]>([]);
  const [comedy, setComedy] = useState<any[]>(cachedComedy);
  const [animation, setAnimation] = useState<any[]>([]);
  const [scifi, setScifi] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const bestSeriesIds = [1399, 94997, 37680, 1396, 66732, 76479, 60574, 2316, 76331, 100088, 1398, 1402, 60059, 87108, 93405, 42009];
        const [
          bestSeriesRes,
          pop1, pop2,
          dra1, dra2,
          com1, com2,
          ani1, ani2,
          sci1, sci2
        ] = await Promise.all([
          Promise.all(bestSeriesIds.map(id => fetchFromTmdb(`/tv/${id}`).catch(() => null))),
          fetchFromTmdb("/tv/popular", { page: "1" }),
          fetchFromTmdb("/tv/popular", { page: "2" }),
          fetchFromTmdb("/discover/tv", { with_genres: "18", page: "1" }),
          fetchFromTmdb("/discover/tv", { with_genres: "18", page: "2" }),
          fetchFromTmdb("/discover/tv", { with_genres: "35", page: "1" }),
          fetchFromTmdb("/discover/tv", { with_genres: "35", page: "2" }),
          fetchFromTmdb("/discover/tv", { with_genres: "16", page: "1" }),
          fetchFromTmdb("/discover/tv", { with_genres: "16", page: "2" }),
          fetchFromTmdb("/discover/tv", { with_genres: "10765", page: "1" }),
          fetchFromTmdb("/discover/tv", { with_genres: "10765", page: "2" }),
        ]);

        if (!mounted) return;

        const combine = (...responses: any[]) => {
          const all = responses.flatMap((r) => r?.results || []);
          const unique = new Map(all.map((item) => [item.id, item]));
          return Array.from(unique.values());
        };

        const validBest = bestSeriesRes.filter(Boolean);
        const combinedPop = combine(pop1, pop2);
        const finalPopular = [...validBest, ...combinedPop].filter((item, index, self) => self.findIndex(t => t.id === item.id) === index);

        setPopular(finalPopular); cachedPopular = finalPopular;
        setDrama(combine(dra1, dra2));
        setComedy(combine(com1, com2)); cachedComedy = combine(com1, com2);
        setAnimation(combine(ani1, ani2));
        setScifi(combine(sci1, sci2));
      } catch (error) {
        console.error("Failed to fetch series data:", error);
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

  const heroShow = popular[heroIndex];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden">
        {heroShow && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.img
                key={`hero-${heroShow.id}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={getImageUrl(heroShow.backdrop_path, "w1280")}
                alt={heroShow.name}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
          </div>
        )}

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-24 md:pb-32">
          {heroShow && (
            <motion.div
              key={`info-${heroShow.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-3xl"
            >
              <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-tight text-white drop-shadow-lg">
                {heroShow.name || heroShow.title}
              </h1>
              <p className="text-white/60 text-sm md:text-lg mb-8 line-clamp-3 leading-relaxed">
                {heroShow.overview}
              </p>
              <div className="flex gap-4">
                <button onClick={() => openTrailer(heroShow.id, "tv", heroShow.name || heroShow.title, heroShow.first_air_date || heroShow.release_date)} className="px-6 py-2.5 text-sm bg-[#38bdf8] hover:bg-[#0284c7] rounded-md font-bold flex items-center gap-2 transition-colors text-white">
                  <Play className="w-5 h-5 fill-current" /> Watch Now
                </button>
                <Link
                  to={`/movie/${heroShow.id}?type=tv`}
                  className="px-6 py-2.5 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-md font-bold transition-colors text-white"
                >
                  More Info
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Popular Series */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Popular Series</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {popular.slice(0, 30).map((show, idx) => (
              <div key={`pop-${show.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...show, media_type: 'tv' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drama Series */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Gripping Dramas</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {drama.slice(0, 30).map((show, idx) => (
              <div key={`dra-${show.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...show, media_type: 'tv' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comedy Series (Grid) */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Comedy Series</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
          {comedy.slice(0, 24).map((show, idx) => (
            <MovieCard key={`com-${show.id}-${idx}`} movie={{ ...show, media_type: 'tv' }} />
          ))}
        </div>
      </section>

      {/* Sci-Fi & Fantasy */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Sci-Fi & Fantasy Shows</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {scifi.slice(0, 30).map((show, idx) => (
              <div key={`sci-${show.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...show, media_type: 'tv' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animation */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <h2 className="text-lg font-semibold text-white mb-4">Animation Series</h2>
        <div className="overflow-x-auto overscroll-x-contain overflow-y-hidden scrollbar-hide pb-4 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 sm:gap-4 md:gap-5" style={{ width: "max-content" }}>
            {animation.slice(0, 30).map((show, idx) => (
              <div key={`ani-${show.id}-${idx}`} className="w-[150px] sm:w-[200px] md:w-[220px]">
                <MovieCard movie={{ ...show, media_type: 'tv' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
