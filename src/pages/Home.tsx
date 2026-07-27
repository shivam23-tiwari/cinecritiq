import React from 'react';
import { useState, useEffect, useMemo } from "react";
import { fetchFromTmdb, getImageUrl } from "../lib/tmdb";
import MovieCard from "../components/MovieCard";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useTrailer } from "../lib/TrailerContext";
import { Play, ChevronRight } from "lucide-react";

let globalUpcoming: any[] = [];
let globalTrending: any[] = [];
let globalRecent: any[] = [];
let globalTopRated: any[] = [];
let globalGames: any[] = [];
let globalNetflix: any[] = [];
let globalUsShows: any[] = [];
let globalVipShows: any[] = [];
let globalRomantic: any[] = [];
let globalSciFi: any[] = [];
let globalBollywood: any[] = [];
let globalKDrama: any[] = [];
let globalYA: any[] = [];
let globalSouthIndian: any[] = [];
let globalTeenTv: any[] = [];
let globalTopSearched: any[] = [];
let globalAnime: any[] = [];
let globalBestShowsIndia: any[] = [];
let globalGhostMovies: any[] = [];
let globalBestSeries: any[] = [];
export let globalPopularSeries: any[] = [];


export default function Home() {
  

  

  

  const { openTrailer } = useTrailer();
  const [upcoming, setUpcoming] = useState<any[]>(globalUpcoming);
  const [trending, setTrending] = useState<any[]>(globalTrending);
  const [recent, setRecent] = useState<any[]>(globalRecent);
  const [topRated, setTopRated] = useState<any[]>(globalTopRated);
  const [games, setGames] = useState<any[]>(globalGames);
  const [netflix, setNetflix] = useState<any[]>(globalNetflix);
  const [usShows, setUsShows] = useState<any[]>(globalUsShows);
  const [vipShows, setVipShows] = useState<any[]>(globalVipShows);
  const [romantic, setRomantic] = useState<any[]>(globalRomantic);
  const [sciFi, setSciFi] = useState<any[]>(globalSciFi);
  const [bollywood, setBollywood] = useState<any[]>(globalBollywood);
  const [kDrama, setKDrama] = useState<any[]>(globalKDrama);
  const [ya, setYa] = useState<any[]>(globalYA);
  const [southIndian, setSouthIndian] = useState<any[]>(globalSouthIndian);
  const [teenTv, setTeenTv] = useState<any[]>(globalTeenTv);
  const [topSearched, setTopSearched] = useState<any[]>(globalTopSearched);
  const [anime, setAnime] = useState<any[]>(globalAnime);
  const [bestShowsIndia, setBestShowsIndia] = useState<any[]>(globalBestShowsIndia);
  const [ghostMovies, setGhostMovies] = useState<any[]>(globalGhostMovies);
  const [bestSeries, setBestSeries] = useState<any[]>(globalBestSeries);
  const [popularSeries, setPopularSeries] = useState<any[]>(globalPopularSeries);
  const [heroIndex, setHeroIndex] = useState(0);

  
  useEffect(() => {
    // Debounce scroll saves to prevent mobile lag
    let scrollTimeout: any;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem('home_scroll_y', window.scrollY.toString());
      }, 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    let carouselListeners: any[] = [];
    
    // Attempt restore
    setTimeout(() => {
      const scrollY = sessionStorage.getItem('home_scroll_y');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
      
      const carousels = document.querySelectorAll('.overflow-x-auto');
      carousels.forEach((c, i) => {
        const scrollX = sessionStorage.getItem(`home_carousel_${i}`);
        if (scrollX) {
          c.scrollLeft = parseInt(scrollX);
        }
        
        let cTimeout: any;
        const cScroll = () => {
          if (cTimeout) clearTimeout(cTimeout);
          cTimeout = setTimeout(() => {
            sessionStorage.setItem(`home_carousel_${i}`, c.scrollLeft.toString());
          }, 150);
        };
        
        c.addEventListener('scroll', cScroll, { passive: true });
        carouselListeners.push({ c, cScroll });
      });
    }, 150);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      carouselListeners.forEach(({ c, cScroll }) => {
        c.removeEventListener('scroll', cScroll);
      });
    };
  }, [trending]);

  useEffect(() => {
    let mounted = true;

    const fetchHomeData = async (isInitial = false) => {
      // If it's the initial load, use globals first so there's no buffering delay.
      if (isInitial && globalTrending.length > 0 && globalRecent.length > 0) {
        setUpcoming(globalUpcoming);
        setTrending(globalTrending);
        setRecent(globalRecent);
        setTopRated(globalTopRated);
        setGames(globalGames);
        setNetflix(globalNetflix);
        setUsShows(globalUsShows);
        setVipShows(globalVipShows);
        setRomantic(globalRomantic);
        setSciFi(globalSciFi);
        setBollywood(globalBollywood);
        setKDrama(globalKDrama);
        setYa(globalYA);
        setSouthIndian(globalSouthIndian);
        setTeenTv(globalTeenTv);
        setTopSearched(globalTopSearched);
        setAnime(globalAnime);
        setBestShowsIndia(globalBestShowsIndia);
        setGhostMovies(globalGhostMovies);
        setBestSeries(globalBestSeries);
        setPopularSeries(globalPopularSeries);
      }
      
      try {
        const [
          u1, u2, u3, u4, u5,
          t1, t2, t3, t4, t5,
          r1, r2, r3, r4, 
          tr1, tr2, tr3, tr4, tr5,
          g1, g2, 
          n1, n2, 
          us1, us2,
          vip1, 
          rom1, rom2, rom3,
          sf1, sf2, sf3,
          bol1, kd1, kd2, ya1, si1, tt1, 
          ts1, ts2, ts3, ts4, ts5,
          ani1, ani2,
          bestIndia, ghost1,
          top1, top2, top3, top4, top5, top6, top7, top8, top9, top10, top11, top12, top13, top14, top15, top16, top17, top18, top19, top20, top21, top22, top23, top24, top25, top26, top27, top28, top29, top30,
          bs1, bs2, bs3, bs4, bs5, bs6, bs7,
          ps1, ps2, ps3, ps4, ps5,
          got, squid, stranger, suits
          ] = await Promise.all([

          fetchFromTmdb("/movie/upcoming", { page: "1" }),
          fetchFromTmdb("/movie/upcoming", { page: "2" }),
          fetchFromTmdb("/movie/upcoming", { page: "3" }),
          fetchFromTmdb("/movie/upcoming", { page: "4" }),
          fetchFromTmdb("/movie/upcoming", { page: "5" }),
          
          fetchFromTmdb("/trending/movie/day", { page: "1" }),
          fetchFromTmdb("/trending/movie/day", { page: "2" }),
          fetchFromTmdb("/trending/movie/day", { page: "3" }),
          fetchFromTmdb("/trending/movie/day", { page: "4" }),
          fetchFromTmdb("/trending/movie/day", { page: "5" }),
          
          fetchFromTmdb("/movie/now_playing", { page: "1" }),
          fetchFromTmdb("/movie/now_playing", { page: "2" }),
          fetchFromTmdb("/tv/on_the_air", { page: "1" }),
          fetchFromTmdb("/tv/on_the_air", { page: "2" }),
          
          fetchFromTmdb("/movie/top_rated", { page: "1" }),
          fetchFromTmdb("/movie/top_rated", { page: "2" }),
          fetchFromTmdb("/movie/top_rated", { page: "3" }),
          fetchFromTmdb("/movie/top_rated", { page: "4" }),
          fetchFromTmdb("/movie/top_rated", { page: "5" }),
          
          fetchFromTmdb("/discover/movie", { with_keywords: "9315", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_keywords: "9315", page: "2" }),
          
          fetchFromTmdb("/discover/movie", { with_watch_providers: "8", watch_region: "US", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_watch_providers: "8", watch_region: "US", page: "2" }),
          
          fetchFromTmdb("/discover/tv", { with_origin_country: "US", page: "1" }),
          fetchFromTmdb("/discover/tv", { with_origin_country: "US", page: "2" }),
          
          fetchFromTmdb("/discover/tv", { with_networks: "49", page: "1" }),
          
          fetchFromTmdb("/discover/movie", { with_genres: "10749", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_genres: "10749", page: "2" }),
          fetchFromTmdb("/discover/movie", { with_genres: "10749", page: "3" }),
          
          fetchFromTmdb("/discover/movie", { with_genres: "878", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_genres: "878", page: "2" }),
          fetchFromTmdb("/discover/tv", { with_genres: "10759", page: "1" }),
          
          fetchFromTmdb("/discover/movie", { with_original_language: "hi", region: "IN", page: "1" }),
          fetchFromTmdb("/discover/tv", { with_original_language: "ko", sort_by: "popularity.desc", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_original_language: "ko", sort_by: "popularity.desc", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_genres: "10751,18", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_original_language: "te|ta|ml|kn", region: "IN", sort_by: "popularity.desc", page: "1" }),
          fetchFromTmdb("/discover/tv", { with_genres: "18,10762", page: "1" }),
          
          fetchFromTmdb("/movie/popular", { page: "1" }),
          fetchFromTmdb("/movie/popular", { page: "2" }),
          fetchFromTmdb("/movie/popular", { page: "3" }),
          fetchFromTmdb("/movie/popular", { page: "4" }),
          fetchFromTmdb("/movie/popular", { page: "5" }),
          

                  fetchFromTmdb("/discover/tv", { with_genres: "16", with_keywords: "210024", with_original_language: "ja", sort_by: "popularity.desc", page: "1", include_adult: "false" }),
          fetchFromTmdb("/discover/movie", { with_genres: "16", with_keywords: "210024", with_original_language: "ja", sort_by: "popularity.desc", page: "1", include_adult: "false" }),
          fetchFromTmdb("/discover/tv", { with_origin_country: "IN", sort_by: "popularity.desc", page: "1" }),
          fetchFromTmdb("/discover/movie", { with_genres: "27", sort_by: "popularity.desc", page: "1" }),
          fetchFromTmdb("/tv/37854"),
          fetchFromTmdb("/tv/31910"),
          fetchFromTmdb("/tv/30984"),
          fetchFromTmdb("/tv/1429"),
          fetchFromTmdb("/tv/65930"),
          fetchFromTmdb("/tv/85937"),
          fetchFromTmdb("/tv/95479"),
          fetchFromTmdb("/tv/46260"),
          fetchFromTmdb("/tv/13916"),
          fetchFromTmdb("/tv/12971"),
          fetchFromTmdb("/tv/62715"),
          fetchFromTmdb("/tv/31911"),
          fetchFromTmdb("/tv/46261"),
          fetchFromTmdb("/tv/73223"),
          fetchFromTmdb("/tv/45782"),
          fetchFromTmdb("/tv/61374"),
          fetchFromTmdb("/tv/45790"),
          fetchFromTmdb("/tv/63926"),
          fetchFromTmdb("/tv/67075"),
          fetchFromTmdb("/tv/30991"),
          fetchFromTmdb("/tv/890"),
          fetchFromTmdb("/tv/42509"),
          fetchFromTmdb("/tv/31724"),
          fetchFromTmdb("/tv/60863"),
          fetchFromTmdb("/tv/45783"),
          fetchFromTmdb("/tv/88803"),
          fetchFromTmdb("/tv/120089"),
          fetchFromTmdb("/tv/114410"),
          fetchFromTmdb("/tv/131041"),
          fetchFromTmdb("/tv/86031"),
          fetchFromTmdb("/tv/119051"), // House of the dragon
          fetchFromTmdb("/tv/1399"), // Game of thrones
          fetchFromTmdb("/tv/124364"), // From
          fetchFromTmdb("/tv/37680"), // Suits
          fetchFromTmdb("/tv/110316"), // Alice
          fetchFromTmdb("/tv/93405"), // Squid Game
          fetchFromTmdb("/tv/66732"), // Stranger things
          fetchFromTmdb("/tv/popular", { page: "1" }),
          fetchFromTmdb("/tv/popular", { page: "2" }),
          fetchFromTmdb("/tv/popular", { page: "3" }),
          fetchFromTmdb("/tv/popular", { page: "4" }),
          fetchFromTmdb("/tv/popular", { page: "5" }),
          fetchFromTmdb("/tv/1399"),
          fetchFromTmdb("/tv/93405"),
          fetchFromTmdb("/tv/66732"),
          fetchFromTmdb("/tv/37680")
        ]);

        if (!mounted) return;

        // Remove duplicates, combine and filter missing posters
        const combine = (...responses: any[]) => {
          const all = responses.flatMap((r) => r?.results || []);
          const valid = all.filter((item) => item && item.poster_path);
          const unique = new Map(valid.map((item) => [item.id, item]));
          return Array.from(unique.values());
        };

        const today = new Date().toISOString().split('T')[0];
        const newUpcoming = combine(u1, u2, u3, u4, u5).filter((movie: any) => movie.release_date && movie.release_date > today);
        const newTrending = combine(t1, t2, t3, t4, t5);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
        const newRecent = combine(r1, r2, r3, r4).filter(item => {
          const rDate = item.release_date || item.first_air_date;
          return rDate && rDate <= today && rDate >= thirtyDaysAgoStr && (item.vote_average >= 6.5 || item.popularity >= 100);
        }).sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01').getTime();
          return dateB - dateA;
        });
        const newTopRated = combine(tr1, tr2, tr3, tr4, tr5);
        const newGames = combine(g1, g2);
        const newNetflix = combine(n1, n2);
        const newUsShows = combine(us1, us2);
        const newVipShows = combine(vip1);
        const newRomantic = combine(rom1, rom2, rom3);
        const newSciFi = combine(sf1, sf2, sf3);
        const newBollywood = combine(bol1);
        const newKDrama = combine(kd1, kd2);
        const newYa = combine(ya1);
        const newSouthIndian = combine(si1);
        const newTeenTv = combine(tt1);
        const newTopSearched = combine(ts1, ts2, ts3, ts4, ts5);
        const specificSeries = [got, squid, stranger, suits].filter(m => m && m.id && m.poster_path).map(m => ({...m, media_type: 'tv'}));
        const fetchedPopular = combine(ps1, ps2, ps3, ps4, ps5);
        const newPopularSeries = [...specificSeries, ...fetchedPopular.filter(item => !specificSeries.find(s => s.id === item.id))];
        const staticAnimeIds = [37854, 31910, 30984, 1429, 65930, 85937, 95479, 46260, 13916, 12971, 62715, 31911, 46261, 73223, 45782, 61374, 45790, 63926, 67075, 30991, 890, 42509, 31724, 60863, 45783, 88803, 120089, 114410, 131041, 86031];
        
        // Use ONLY the 30 specific animes so no non-anime can leak in
        let newAnime = combine({results:[top1, top2, top3, top4, top5, top6, top7, top8, top9, top10, top11, top12, top13, top14, top15, top16, top17, top18, top19, top20, top21, top22, top23, top24, top25, top26, top27, top28, top29, top30]});
        
        // Move static animes to top
        const topAnimes = newAnime.filter(a => staticAnimeIds.includes(a.id));
        
        // Sort top animes by static order
        topAnimes.sort((a, b) => staticAnimeIds.indexOf(a.id) - staticAnimeIds.indexOf(b.id));
        
        newAnime = topAnimes;
        const newBestShowsIndia = combine(bestIndia);
        const newGhostMovies = combine(ghost1);
        const newBestSeries = combine({results:[bs1, bs2, bs3, bs4, bs5, bs6, bs7]});

        globalUpcoming = newUpcoming;
        globalTrending = newTrending;
        globalRecent = newRecent;
        globalTopRated = newTopRated;
        globalGames = newGames;
        globalNetflix = newNetflix;
        globalUsShows = newUsShows;
        globalVipShows = newVipShows;
        globalRomantic = newRomantic;
        globalSciFi = newSciFi;
        globalBollywood = newBollywood;
        globalKDrama = newKDrama;
        globalYA = newYa;
        globalSouthIndian = newSouthIndian;
        globalTeenTv = newTeenTv;
        globalTopSearched = newTopSearched;
        globalAnime = newAnime;
        globalBestShowsIndia = newBestShowsIndia;
        globalGhostMovies = newGhostMovies;
        globalBestSeries = newBestSeries;
        globalPopularSeries = newPopularSeries;

        setUpcoming(newUpcoming);
        setTrending(newTrending);
        setRecent(newRecent);
        setTopRated(newTopRated);
        setGames(newGames);
        setNetflix(newNetflix);
        setUsShows(newUsShows);
        setVipShows(newVipShows);
        setRomantic(newRomantic);
        setSciFi(newSciFi);
        setBollywood(newBollywood);
        setKDrama(newKDrama);
        setYa(newYa);
        setSouthIndian(newSouthIndian);
        setTeenTv(newTeenTv);
        setTopSearched(newTopSearched);
        setAnime(newAnime);
        setBestShowsIndia(newBestShowsIndia);
        setGhostMovies(newGhostMovies);
        setBestSeries(newBestSeries);
        setPopularSeries(newPopularSeries);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      }
    };
    
    fetchHomeData(true);
    
    // Automatically check for new movies every 60 seconds
    const interval = setInterval(() => fetchHomeData(false), 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const heroMovies = useMemo(() => {
    const source = recent.length > 0 ? recent : trending;
    return source
      .filter((m) => m.backdrop_path && m.release_date)
      .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
      .slice(0, 5);
  }, [recent, trending]);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMovies.length); // Cycle top recent movies
    }, 8000);
    return () => clearInterval(interval);
  }, [heroMovies]);

  const heroMovie = heroMovies[heroIndex] || heroMovies[0];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[90vh] w-full overflow-hidden pt-20 flex items-end">
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

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-32 mt-auto">
          {heroMovie && (
            <motion.div
              key={heroMovie.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-3xl"
            >
              <div className="flex items-end gap-4 mb-4">
                {heroMovie.poster_path && (
                  <img 
                    src={getImageUrl(heroMovie.poster_path, "w500")} 
                    alt={heroMovie.title} 
                    className="w-24 md:hidden rounded shadow-lg border border-white/10" 
                  />
                )}
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-lg">
                  {heroMovie.title}
                </h1>
              </div>
              <p className="text-white/60 text-base md:text-lg mb-8 line-clamp-2 leading-relaxed">
                {heroMovie.overview}
              </p>
              <div className="flex gap-4">
                <button onClick={() => openTrailer(heroMovie.id, "movie", heroMovie.title, heroMovie.release_date)} className="px-6 py-2.5 text-sm bg-[#38bdf8] hover:bg-[#0284c7] rounded-md font-bold flex items-center gap-2 transition-colors text-white">
                  <Play className="w-5 h-5 fill-current" /> Watch Now
                </button>
                <Link
                  to={`/movie/${heroMovie.id}`}
                  className="px-6 py-2.5 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-md font-bold transition-colors text-white"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>


            {/* Upcoming Best Movies */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Best Movies</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {upcoming.map((movie, idx) => (
              <div key={`upcoming-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Released Movies */}
      {recent.length > 0 && (
        <section className="py-8 px-6 md:px-10 relative z-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recently Released Movies</h2>
          </div>
          <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
            <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
              {recent.map((movie, idx) => (
                <div key={`recent-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      
      {/* Popular TV Series */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Popular TV Series</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {popularSeries.map((movie, idx) => (
              <div key={`ps-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Only on Netflix */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Only on Netflix</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {netflix.map((movie, idx) => (
              <div key={`nflx-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Science Fiction */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Science Fiction</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {sciFi.map((movie, idx) => (
              <div key={`scifi-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>


      
      {/* Popular Movies */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Popular Movies</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {topSearched.map((movie, idx) => (
              <div key={`pop-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Games & Movies For You */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Games & Movies For You</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {games.map((movie, idx) => (
              <div key={`game-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Ghost Movies & Series */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Ghost Movies & Series</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {ghostMovies.map((movie, idx) => (
              <div key={`ghost-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Best Shows in India Today */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Best Shows in India Today</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {bestShowsIndia.map((movie, idx) => (
              <div key={`india-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* U.S. TV Shows */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">U.S. TV Shows</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {usShows.map((show, idx) => (
              <div key={`us-${show.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={show} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 V.I.P. Shows */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#D4AF37] flex items-center gap-2">⭐ 10 V.I.P. Shows</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {vipShows.map((show, idx) => (
              <div key={`vip-${show.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={show} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Grid */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Top 20 Best Movies of All Time
          </h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {topRated.slice(0, 20).map((movie, idx) => (
              <div key={`tr-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Romantic Movies - Grid */}
      <section className="py-12 px-6 md:px-10 relative z-20 bg-gradient-to-t from-pink-950/20 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-pink-300">
            For You: Most Romantic Movies ❤️
          </h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {romantic.map((movie, idx) => (
              <div key={`rom-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bollywood */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Bollywood Hits</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {bollywood.map((movie, idx) => (
              <div key={`bolly-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* K-drama emotional movies */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Best K-Dramas (Series & Movies)</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {kDrama.map((movie, idx) => (
              <div key={`kdrama-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Young adult movies and shows */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Young Adult Movies & Shows</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {ya.map((movie, idx) => (
              <div key={`ya-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* South Indian movies (Grid) */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">South Indian Cinema</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {southIndian.map((movie, idx) => (
              <div key={`south-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teen TV dramas */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Teen TV Dramas</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {teenTv.map((movie, idx) => (
              <div key={`teen-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>
  
      {/* Anime */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Best Anime</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {anime.map((movie, idx) => (
              <div key={`anime-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
            <div className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px] h-auto aspect-[2/3]">
              <Link to="/anime" className="w-full h-full flex flex-col items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 text-white/50 hover:text-white group">
                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-white/20 flex items-center justify-center mb-3 transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm tracking-wide">All Anime</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Best Series of All Time */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Best Series of All Time</h2>
        </div>
        <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {bestSeries.map((movie, idx) => (
              <div key={`bs-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>
</div>);
}

