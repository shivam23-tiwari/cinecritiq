import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchFromTmdb } from "../lib/tmdb";
import MovieCard from "../components/MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function YearPage() {
  const { year } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const isDecade = year?.endsWith('s');
  const numericVal = year ? parseInt(year.replace('s', '')) : new Date().getFullYear();
  const decadeStart = Math.floor(numericVal / 10) * 10;
  
  const currentLabel = year || new Date().getFullYear().toString();

  useEffect(() => {
    const loadMore = async () => {
      if (loadingMore || page >= totalPages) return;
      
      setLoadingMore(true);
      const nextPage = page + 1;
      
      try {
        const params: any = {
          sort_by: "popularity.desc",
          page: nextPage.toString(),
        };

        if (isDecade) {
          params["primary_release_date.gte"] = `${decadeStart}-01-01`;
          params["primary_release_date.lte"] = `${decadeStart + 9}-12-31`;
        } else {
          params["primary_release_date.gte"] = `${numericVal}-01-01`;
          params["primary_release_date.lte"] = `${numericVal}-12-31`;
        }

        const res = await fetchFromTmdb("/discover/movie", params);
        
        if (res?.results) {
          setMovies(prev => {
            const all = [...prev, ...res.results];
            const unique = new Map(all.map(item => [item.id, item]));
            return Array.from(unique.values());
          });
          setPage(nextPage);
        }
      } catch (error) {
        console.error("Error loading more:", error);
      } finally {
        setLoadingMore(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: '2500px' }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [page, totalPages, loading, loadingMore, isDecade, decadeStart, numericVal]);

  useEffect(() => {
    if (!year) {
      navigate(`/films/year/${new Date().getFullYear()}`, { replace: true });
      return;
    }

    const fetchYearData = async () => {
      setLoading(true);
      setPage(1);
      try {
        const params: any = {
          sort_by: "popularity.desc",
        };

        if (isDecade) {
          params["primary_release_date.gte"] = `${decadeStart}-01-01`;
          params["primary_release_date.lte"] = `${decadeStart + 9}-12-31`;
        } else {
          params["primary_release_date.gte"] = `${numericVal}-01-01`;
          params["primary_release_date.lte"] = `${numericVal}-12-31`;
        }

        const res1 = await fetchFromTmdb("/discover/movie", { ...params, page: "1" });

        const allResults = [
          ...(res1?.results || [])
        ];
        
        const unique = new Map(allResults.map((item) => [item.id, item]));
        setMovies(Array.from(unique.values()));

        if (res1 !== undefined && res1.total_results !== undefined) {
          setTotalResults(res1.total_results);
          setTotalPages(res1.total_pages);
        }
      } catch (error) {
        console.error("Error fetching year data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYearData();
  }, [year, isDecade, decadeStart, numericVal, navigate]);

  const maxYear = 2031;
  const minYear = 1870;
  const yearLinks = Array.from({ length: 10 }, (_, i) => decadeStart + i).filter(y => y <= maxYear && y >= minYear);

  return (
    <div className="w-full min-h-screen bg-[#14181c] text-white pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Area */}
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
          <h1 className="text-sm font-semibold text-white/50 tracking-widest uppercase">Films</h1>
        </div>

        {/* Year Navigation Bar */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between bg-[#1c2228] border border-white/5 rounded mx-auto w-full">
            <button 
              onClick={() => decadeStart > minYear && navigate(`/films/year/${decadeStart - 10}s`)}
              className={`p-3 transition-colors border-r border-white/5 shrink-0 flex items-center justify-center ${decadeStart <= minYear ? 'text-white/20 cursor-not-allowed' : 'text-white/50 hover:text-white'}`}
              disabled={decadeStart <= minYear}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex flex-nowrap items-center md:justify-center flex-1 p-1 gap-1 md:gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
              <Link 
                to={`/films/year/${decadeStart}s`}
                className={`px-3 md:px-4 py-2 text-sm font-medium transition-colors rounded shrink-0 text-center ${
                  isDecade 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {decadeStart}s
              </Link>

              {yearLinks.map(y => (
                <Link 
                  key={y}
                  to={`/films/year/${y}`}
                  className={`px-3 md:px-4 py-2 text-sm font-medium transition-colors rounded shrink-0 text-center ${
                    !isDecade && y === numericVal 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {y}
                </Link>
              ))}
            </div>
            
            <button 
              onClick={() => decadeStart < 2030 && navigate(`/films/year/${decadeStart + 10}s`)}
              className={`p-3 transition-colors border-l border-white/5 shrink-0 flex items-center justify-center ${decadeStart >= 2030 ? 'text-white/20 cursor-not-allowed' : 'text-white/50 hover:text-white'}`}
              disabled={decadeStart >= 2030}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Total Count Banner */}
        <div className="bg-[#1c2228] border border-white/5 rounded p-3 text-center mb-8 shadow-sm">
          <p className="text-sm text-white/60">
            There are <span className="font-bold text-white">{totalResults.toLocaleString()}</span> films released in {isDecade ? "the " : ""}<span className="font-bold text-white">{currentLabel}</span>.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-white/10 border-t-[#00e054] rounded-full animate-spin"></div>
          </div>
        ) : (
          /* Movie Grid */
          <>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {movies.map((movie, idx) => (
                <div key={`${movie.id}-${idx}`} className="relative group">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Observer Target */}
            <div 
              ref={observerTarget} 
              className="w-full h-20 flex justify-center items-center mt-8"
            >
              {loadingMore && (
                <div className="w-6 h-6 border-4 border-white/10 border-t-[#00e054] rounded-full animate-spin"></div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
