import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { fetchFromTmdb, getImageUrl } from '../lib/tmdb';
import { ChevronDown, Share } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from '../lib/firestore-wrapper';

const GENRES = [
  { id: 'All', name: 'All' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
  { id: '36', name: 'History' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Science Fiction' },
  { id: '10770', name: 'TV Movie' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' }
];

const SERVICES = [
  'All', 'Netflix', 'Amazon Prime', 'Disney+', 'Apple TV+', 'Hulu', 'HBO Max'
];

const SORT_OPTIONS = [
  { id: 'popularity', name: 'Popularity' },
  { id: 'release_date_desc', name: 'Release Date (Newest)' },
  { id: 'release_date_asc', name: 'Release Date (Oldest)' },
  { id: 'vote_average', name: 'Highest Rating' },
];

export default function PersonPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user, customPosters } = useAuth();
  
  const [person, setPerson] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeRole, setActiveRole] = useState<string>('Director');
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [watchedMovies, setWatchedMovies] = useState<Set<number>>(new Set());
  
  const [decade, setDecade] = useState<string>('All');
  const [genre, setGenre] = useState<string>('All');
  const [service, setService] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('popularity');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!id) return;
    
    const loadPerson = async () => {
      setLoading(true);
      try {
        const [personData, creditsData] = await Promise.all([
          fetchFromTmdb(`/person/${id}`),
          fetchFromTmdb(`/person/${id}/movie_credits`)
        ]);
        setPerson(personData);
        setCredits(creditsData);
        
        if (location.state?.activeRole && (creditsData.cast?.length > 0 || creditsData.crew?.length > 0)) {
          setActiveRole(location.state.activeRole);
        } else if (personData.known_for_department === 'Acting') {
          setActiveRole('Actor');
        } else if (personData.known_for_department === 'Directing') {
          setActiveRole('Director');
        } else {
          setActiveRole(personData.known_for_department || 'Actor');
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadPerson();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    const fetchWatched = async () => {
      try {
        const q = query(
          collection(db, `users/${user.uid}/movieActions`),
          where('actionType', '==', 'watched')
        );
        const snapshot = await getDocs(q);
        const watchedIds = new Set<number>();
        snapshot.docs.forEach(doc => {
          watchedIds.add(doc.data().movieId);
        });
        setWatchedMovies(watchedIds);
      } catch (error) {
        console.error("Error fetching watched movies:", error);
      }
    };
    fetchWatched();
  }, [user, id]);

  const { roles, roleCounts } = useMemo(() => {
    if (!credits) return { roles: {}, roleCounts: {} };
    
    const r: Record<string, any[]> = {};
    
    if (credits.cast && credits.cast.length > 0) {
      r['Actor'] = credits.cast.filter((c: any) => {
        const title = c.title || c.name || "";
        return !title.toLowerCase().includes("untitled") && !!c.poster_path;
      });
    }
    
    if (credits.crew) {
      credits.crew.forEach((c: any) => {
        let job = c.job;
        if (job === 'Director of Photography') job = 'Cinematography';
        if (job === 'Original Music Composer') job = 'Composer';
        
        if (['Director', 'Writer', 'Editor', 'Producer', 'Cinematography', 'Composer', 'Executive Producer', 'Sound'].includes(job)) {
          if (!r[job]) r[job] = [];
          
          if (!r[job].find(m => m.id === c.id)) {
            // Filter out unknown/untitled movies or those missing images
            const title = c.title || c.name || "";
            if (title.toLowerCase().includes("untitled") || !c.poster_path) {
              return;
            }
            r[job].push(c);
          }
        }
      });
    }
    
    const counts: Record<string, number> = {};
    Object.keys(r).forEach(k => counts[k] = r[k].length);
    
    return { roles: r, roleCounts: counts };
  }, [credits]);

  const moviesForActiveRole = useMemo(() => {
    let list = roles[activeRole] || [];
    
    if (decade !== 'All') {
      const decStart = parseInt(decade);
      list = list.filter(m => {
        if (!m.release_date) return false;
        const y = parseInt(m.release_date.substring(0, 4));
        return y >= decStart && y < decStart + 10;
      });
    }

    if (genre !== 'All') {
      const genreId = parseInt(genre);
      list = list.filter(m => m.genre_ids?.includes(genreId));
    }
    
    // Service filtering would normally happen here, but we lack provider data in /movie_credits. 
    // We mock the selection but don't filter to avoid returning 0 results for everything.
    
    if (sortOption === 'popularity') {
       list = [...list].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortOption === 'release_date_desc') {
       list = [...list].sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime());
    } else if (sortOption === 'release_date_asc') {
       list = [...list].sort((a, b) => new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime());
    } else if (sortOption === 'vote_average') {
       list = [...list].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    }

    return list;
  }, [roles, activeRole, decade, genre, service, sortOption]);

  const decades = useMemo(() => {
    const list = roles[activeRole] || [];
    const decadesSet = new Set<number>();
    list.forEach(m => {
      if (m.release_date) {
        const y = parseInt(m.release_date.substring(0, 4));
        decadesSet.add(Math.floor(y / 10) * 10);
      }
    });
    return Array.from(decadesSet).sort((a, b) => b - a);
  }, [roles, activeRole]);

  const availableGenres = useMemo(() => {
    const list = roles[activeRole] || [];
    const genreIds = new Set<number>();
    list.forEach(m => {
      if (m.genre_ids) {
        m.genre_ids.forEach((id: number) => genreIds.add(id));
      }
    });
    return GENRES.filter(g => g.id === 'All' || genreIds.has(parseInt(g.id)));
  }, [roles, activeRole]);

  const watchedCount = useMemo(() => {
    if (!roles[activeRole]) return 0;
    return roles[activeRole].filter(m => watchedMovies.has(m.id)).length;
  }, [roles, activeRole, watchedMovies]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Films by ${person?.name}`,
          url: window.location.href
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#14181c] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#00e054] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!person) return null;

  const totalInRole = roles[activeRole]?.length || 0;
  const watchedPercentage = totalInRole > 0 ? Math.round((watchedCount / totalInRole) * 100) : 0;
  const bio = person.biography ? (person.biography.length > 300 ? person.biography.substring(0, 300) + '...' : person.biography) : `${person.name} is known for their work in the film industry, contributing to various productions in the role of ${person.known_for_department || 'Cast'}.`;

  return (
    <div className="w-full min-h-screen bg-[#14181c] text-[#8aa8cc] pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1">
            <h1 className="text-xs uppercase tracking-widest text-[#9ab] mb-1">
              FILMS {activeRole === 'Actor' ? 'STARRING' : activeRole.toUpperCase() + ' BY'}
            </h1>
            <h2 className="text-3xl font-bold text-white mb-6 font-serif tracking-tight">{person.name}</h2>
            
            <div className="flex flex-wrap items-center gap-4 py-2 border-y border-[#2c3440] mb-6 text-xs uppercase tracking-widest font-medium" ref={dropdownRef}>
              
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'role' ? null : 'role')}
                  className="flex items-center gap-1 hover:text-white transition-colors py-2"
                >
                  {activeRole}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeDropdown === 'role' && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#2c3440] rounded shadow-xl border border-white/10 z-50 overflow-hidden">
                    {Object.keys(roles).map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          setActiveRole(role);
                          setActiveDropdown(null);
                          setDecade('All');
                          setGenre('All');
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors flex justify-between items-center ${activeRole === role ? 'text-white' : 'text-[#8aa8cc]'}`}
                      >
                        <span>{role}</span>
                        <span className="text-white/40">{roleCounts[role]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {decades.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === 'decade' ? null : 'decade')}
                    className={`flex items-center gap-1 hover:text-white transition-colors py-2 ${decade !== 'All' ? 'text-white' : ''}`}
                  >
                    DECADE {decade !== 'All' && <span>({decade}s)</span>}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {activeDropdown === 'decade' && (
                    <div className="absolute top-full left-0 mt-1 w-32 bg-[#2c3440] rounded shadow-xl border border-white/10 z-50 overflow-hidden">
                      <button 
                        onClick={() => { setDecade('All'); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 hover:bg-white/10 ${decade === 'All' ? 'text-white' : 'text-[#8aa8cc]'}`}
                      >
                        All
                      </button>
                      {decades.map(d => (
                        <button
                          key={d}
                          onClick={() => { setDecade(d.toString()); setActiveDropdown(null); }}
                          className={`w-full text-left px-4 py-2 hover:bg-white/10 ${decade === d.toString() ? 'text-white' : 'text-[#8aa8cc]'}`}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'genre' ? null : 'genre')}
                  className={`flex items-center gap-1 hover:text-white transition-colors py-2 ${genre !== 'All' ? 'text-white' : ''}`}
                >
                  GENRE {genre !== 'All' && <span>({GENRES.find(g => g.id === genre)?.name})</span>}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeDropdown === 'genre' && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#2c3440] rounded shadow-xl border border-white/10 z-50 max-h-64 overflow-y-auto">
                    {availableGenres.map(g => (
                      <button
                        key={g.id}
                        onClick={() => { setGenre(g.id); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 hover:bg-white/10 ${genre === g.id ? 'text-white' : 'text-[#8aa8cc]'}`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'service' ? null : 'service')}
                  className={`flex items-center gap-1 hover:text-white transition-colors py-2 ${service !== 'All' ? 'text-white' : ''}`}
                >
                  SERVICE {service !== 'All' && <span>({service})</span>}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeDropdown === 'service' && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-[#2c3440] rounded shadow-xl border border-white/10 z-50 max-h-64 overflow-y-auto">
                    {SERVICES.map(s => (
                      <button
                        key={s}
                        onClick={() => { setService(s); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 hover:bg-white/10 ${service === s ? 'text-white' : 'text-[#8aa8cc]'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative ml-auto">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                  className="flex items-center gap-1 hover:text-white transition-colors py-2 text-white"
                >
                  Sort by {SORT_OPTIONS.find(s => s.id === sortOption)?.name.toUpperCase()}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {activeDropdown === 'sort' && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-[#2c3440] rounded shadow-xl border border-white/10 z-50">
                    {SORT_OPTIONS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSortOption(s.id); setActiveDropdown(null); }}
                        className={`w-full text-left px-4 py-2 hover:bg-white/10 ${sortOption === s.id ? 'text-white' : 'text-[#8aa8cc]'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {moviesForActiveRole.length === 0 ? (
              <div className="py-12 text-center text-white/50">
                No movies found matching the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 mb-8">
                {moviesForActiveRole.map((movie: any, idx) => (
                  <div key={`${movie.id}-${idx}`} className="relative group border border-transparent hover:border-white/20 transition-all rounded overflow-hidden aspect-[2/3]">
                    <Link to={`/movie/${movie.id}`}>
                      { (customPosters?.[movie.id] || movie.poster_path) ? (
                        <>
                          <img 
                            src={customPosters?.[movie.id] || getImageUrl(movie.poster_path, 'w500')} 
                            alt={movie.title || movie.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                              e.currentTarget.style.display = 'none'; 
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.classList.remove('hidden');
                                e.currentTarget.nextElementSibling.classList.add('flex');
                              }
                            }}
                          />
                          <div className="hidden w-full h-full flex-col items-center justify-center text-white/30 text-[10px] uppercase bg-neutral-900 text-center px-2 leading-normal absolute inset-0">
                              <span className="text-white/70 font-bold mb-1 truncate w-full">{movie.title || movie.name}</span>
                              <span className="text-[8px] opacity-50">No Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-[10px] uppercase bg-neutral-900 text-center px-2 leading-normal">
                            <span className="text-white/70 font-bold mb-1 truncate w-full">{movie.title || movie.name}</span>
                            <span className="text-[8px] opacity-50">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors"></div>
                      {watchedMovies.has(movie.id) && (
                        <div className="absolute top-2 right-2 text-[#00e054]">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 drop-shadow-md">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="lg:w-72 shrink-0">
            <div className="rounded overflow-hidden border border-[#2c3440] mb-4">
              <img 
                src={getImageUrl(person.profile_path, 'w500') || `https://via.placeholder.com/500x750?text=${encodeURIComponent(person.name)}`}
                alt={person.name}
                className="w-full object-cover aspect-[2/3]"
              />
            </div>
            
            <p className="text-sm text-[#8aa8cc] leading-relaxed mb-4">
              {person.name} {person.birthday ? `(born ${new Date(person.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})})` : ''} {person.name || 'This person'} is known for their work in the film industry. {bio}
            </p>
            
            <a 
              href={`https://www.themoviedb.org/person/${person.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-6"
            >
              More details at <span className="px-1.5 py-0.5 bg-white/10 rounded text-white ml-1">TMDB</span>
            </a>
            
            <button 
              onClick={handleShare}
              className="w-full bg-[#2c3440] hover:bg-[#455568] text-white py-2.5 rounded text-sm font-medium transition-colors mb-6 flex justify-center items-center gap-2"
            >
              Share
            </button>
            
            <div className="bg-[#1a1f24] border border-[#2c3440] rounded p-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-[#8aa8cc]">You've watched<br/>{watchedCount} of {totalInRole}</span>
                <span className="text-2xl font-light text-white">{watchedPercentage}<span className="text-sm text-[#8aa8cc]">%</span></span>
              </div>
              <div className="w-full h-1 bg-[#2c3440] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00e054] transition-all duration-1000" 
                  style={{ width: `${watchedPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
