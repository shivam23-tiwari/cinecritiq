import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchFromTmdb } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import { collection, query, getDocs } from '../lib/firestore-wrapper';
import { db } from '../lib/firebase';
import { Users, Film, Crown, CheckCircle2 } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q');
  const yearParam = searchParams.get('year');
  const directorId = searchParams.get('directorId');
  const directorName = searchParams.get('directorName');
  const genreId = searchParams.get('genreId');
  const genreName = searchParams.get('genreName');
  
  const [activeTab, setActiveTab] = useState<'movies' | 'users'>('movies');
  const [results, setResults] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        if (queryParam) {
          const [movieRes, usersSnap] = await Promise.all([
            fetchFromTmdb('/search/multi', { query: queryParam, include_adult: 'false' }),
            getDocs(collection(db, 'users')).catch(err => { console.error("Error fetching users:", err); return { forEach: () => {} }; })
          ]);
          
          const lowercaseQuery = queryParam.toLowerCase();
          setResults((movieRes.results || []).filter((item: any) => item.media_type !== 'person'));
          
          const users: any[] = [];
          usersSnap.forEach(doc => {
            const data: any = doc.data();
            if (data.displayName && data.displayName.toLowerCase().includes(lowercaseQuery)) {
              users.push({ id: doc.id, ...data });
            } else if (data.email && data.email.toLowerCase().includes(lowercaseQuery)) {
              users.push({ id: doc.id, ...data });
            }
          });
          setUserResults(users);
        } else if (yearParam) {
          const movieRes = await fetchFromTmdb('/discover/movie', { 
            primary_release_year: yearParam,
            sort_by: 'vote_average.desc',
            'vote_count.gte': '300'
          });
          setResults(movieRes.results || []);
          setUserResults([]);
        } else if (directorId) {
          const movieRes = await fetchFromTmdb('/discover/movie', { with_crew: directorId });
          setResults(movieRes.results || []);
          setUserResults([]);
        } else if (genreId) {
          const movieRes = await fetchFromTmdb('/discover/movie', { with_genres: genreId });
          setResults(movieRes.results || []);
          setUserResults([]);
        } else {
          setResults([]);
          setUserResults([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [queryParam, yearParam, directorId, genreId]);

  let displayQuery = queryParam || '';
  if (yearParam) displayQuery = `Year: ${yearParam}`;
  if (directorName) displayQuery = `Director: ${directorName}`;
  if (genreName) displayQuery = `Genre: ${genreName}`;

  const CATEGORIES = [
    "Science fiction", "Stand-up", "Romantic", "Reality and talk", "India",
    "International horror", "Hollywood", "Fantasy", "Drama", "Documentary",
    "Comedies", "Kid and family", "Bollywood", "Blockbuster", "Biography",
    "Sports", "Anime", "Action", "English", "Malayalam", "Telugu", "Hindi",
    "Tamil", "WWE", "Astrology", "Modes", "Year", "Raj films", "Blog"
  ];

  if (!queryParam && !yearParam && !directorId && !genreId) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-12 min-h-screen">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-lg mb-2">
          <span className="text-[#38bdf8]">EXPLORE</span> CATEGORIES
        </h1>
        <p className="text-white/60 mb-8 text-lg font-medium">Browse popular topics and genres</p>
        
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              to={`/search?q=${encodeURIComponent(cat)}`}
              className="px-5 py-2.5 bg-white/5 hover:bg-[#38bdf8] border border-white/10 hover:border-[#38bdf8] rounded-full text-white font-medium transition-all"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-12 min-h-screen">
      <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-lg mb-2">
        <span className="text-[#38bdf8]">SEARCH</span> RESULTS
      </h1>
      <p className="text-white/60 mb-8 text-lg font-medium">Showing results for "{displayQuery}"</p>
      
      <div className="flex items-center gap-4 border-b border-white/10 mb-8 pb-4">
        <button 
          onClick={() => setActiveTab('movies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'movies' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <Film className="w-4 h-4" /> Movies ({results.length})
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Users ({userResults.length})
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38bdf8]"></div>
        </div>
      ) : activeTab === 'movies' ? (
        results.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
            {results.map((movie, idx) => (
              <MovieCard key={`${movie.id}-${idx}`} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/40">
            No movies found matching your search.
          </div>
        )
      ) : (
        userResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userResults.map(u => (
              <Link 
                key={u.id} 
                to={`/user/${u.id}`} 
                className={`border rounded-xl p-4 flex items-center gap-4 transition-all ${
                  u.isPremium 
                    ? 'bg-gradient-to-r from-[#D4AF37]/10 to-black border-[#D4AF37]/30 hover:border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-full overflow-hidden bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center ${u.isPremium ? 'border-2 border-[#D4AF37]' : ''}`}>
                  {u.photoURL ? (
                    <img referrerPolicy="no-referrer" src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{u.displayName?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate flex items-center gap-1.5">
                    {u.displayName || 'Anonymous User'}
                    {u.displayName === 'shivam 23' && (
                      <span className="bg-red-500/20 text-red-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Admin
                      </span>
                    )}
                    {u.isPremium && <Crown className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37] flex-shrink-0"  />}
                    {(u.mcqWinnerStarUntil && (
                      (typeof u.mcqWinnerStarUntil.toMillis === 'function' && u.mcqWinnerStarUntil.toMillis() > Date.now()) ||
                      (typeof u.mcqWinnerStarUntil.getTime === 'function' && u.mcqWinnerStarUntil.getTime() > Date.now()) ||
                      (typeof u.mcqWinnerStarUntil === 'number' && u.mcqWinnerStarUntil > Date.now())
                    )) && (
                      <span className="bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">GOAT</span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/40">
            No users found matching your search.
          </div>
        )
      )}
    </div>
  );
}
