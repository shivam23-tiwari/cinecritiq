import fs from 'fs';

const code = `import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from '../lib/firestore-wrapper';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getImageUrl } from '../lib/tmdb';

export default function Community() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSameLikeYou, setFilterSameLikeYou] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snap = await getDocs(q);
        
        const fetchedUsers = [];
        
        for (const userDoc of snap.docs) {
          const data = userDoc.data();
          const userId = userDoc.id;
          
          let watchedCount = 0;
          let ratedCount = 0;
          
          const customPosters: Record<string, string> = {};
          const allMoviesMap = new Map();
          
          try {
            const actionsQ = query(collection(db, \`users/\${userId}/movieActions\`));
            const actionsSnap = await getDocs(actionsQ);
            
            actionsSnap.docs.forEach(actionDoc => {
              const actionData = actionDoc.data();
              const movieId = String(actionData.movieId || actionData.id || actionDoc.id.replace('rated_', '').replace('rating_', '').replace('watched_', '').replace('favorite_', ''));
              
              if (actionData.actionType === 'customPoster' && actionData.customPosterUrl) {
                customPosters[movieId] = actionData.customPosterUrl;
              } else {
                if (!allMoviesMap.has(movieId)) {
                  allMoviesMap.set(movieId, {
                     id: movieId,
                     posterPath: actionData.movieData?.poster_path || actionData.poster_path,
                     rating: 0
                  });
                }
                const existing = allMoviesMap.get(movieId);
                if (actionData.rating) existing.rating = actionData.rating;
                
                if (actionData.actionType === 'watched' || actionData.actionType === 'diary' || actionData.actionType === 'rated') {
                  watchedCount++;
                }
                if (actionData.actionType === 'rated' || actionData.actionType === 'diary' || actionData.actionType === 'review') {
                  ratedCount++;
                }
              }
            });

            // Legacy collections
            const legacyCollections = ['favorites', 'watchlist', 'watched', 'ratings', 'diary'];
            for (const colName of legacyCollections) {
               const legacySnap = await getDocs(query(collection(db, \`users/\${userId}/\${colName}\`))).catch(() => null);
               if (legacySnap && legacySnap.docs) {
                  legacySnap.docs.forEach(d => {
                     const data = d.data();
                     const movieId = String(data.id || data.movieId || d.id);
                     if (!allMoviesMap.has(movieId)) {
                       allMoviesMap.set(movieId, {
                         id: movieId,
                         posterPath: data.poster_path || data.movieData?.poster_path,
                         rating: 0
                       });
                     }
                     const existing = allMoviesMap.get(movieId);
                     if (data.rating) existing.rating = data.rating;
                  });
                  if (colName === 'watched' || colName === 'ratings' || colName === 'diary') {
                     watchedCount += legacySnap.size;
                  }
                  if (colName === 'ratings' || colName === 'diary') {
                     ratedCount += legacySnap.size;
                  }
               }
            }
          } catch (e) {
            console.error("Error fetching actions for user", userId, e);
          }
          
          // Favorites 4 logic: EXACT match with Profile.tsx
          const favoriteMovies = Array.from(allMoviesMap.values()).sort((a: any, b: any) => {
            if ((b.rating || 0) !== (a.rating || 0)) {
                return (b.rating || 0) - (a.rating || 0);
            }
            return String(a.id).localeCompare(String(b.id));
          }).slice(0, 4).map(m => ({
             id: m.id,
             posterPath: customPosters[m.id] || (m.posterPath ? getImageUrl(m.posterPath) : null)
          }));
          
          fetchedUsers.push({
            id: userId,
            ...data,
            stats: {
              watched: watchedCount,
              rated: ratedCount
            },
            favoriteMovies
          });
        }
        
        setUsers(fetchedUsers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const currentUserFavorites = users.find(u => u.id === user?.uid)?.favoriteMovies || [];

  let displayedUsers = users
    .map(u => {
      if (!user || u.id === user.uid) return { ...u, commonCount: 0, commonMovies: [] };
      const commonMovies = u.favoriteMovies.filter((fm: any) => 
        currentUserFavorites.some((cf: any) => cf.id === fm.id)
      );
      return { ...u, commonCount: commonMovies.length, commonMovies };
    })
    .filter(u => {
      const name = (u.displayName || u.email || 'user').toLowerCase();
      if (!name.includes(searchTerm.toLowerCase())) return false;
      if (filterSameLikeYou && u.commonCount === 0) return false;
      return true;
    })
    .sort((a, b) => (b.stats?.rated || 0) - (a.stats?.rated || 0));

  if (!searchTerm && !filterSameLikeYou) {
    // Limit to 1 active reviewer if not searching as requested
    displayedUsers = displayedUsers.slice(0, 1);
  }

  const featuredMembers = [...users]
    .sort((a, b) => (b.stats?.watched || 0) - (a.stats?.watched || 0))
    .slice(0, 4);

  const isGoat = (u: any) => {
    if (!u.mcqWinnerStarUntil) return false;
    const now = Date.now();
    if (typeof u.mcqWinnerStarUntil.toMillis === 'function') return u.mcqWinnerStarUntil.toMillis() > now;
    if (typeof u.mcqWinnerStarUntil.getTime === 'function') return u.mcqWinnerStarUntil.getTime() > now;
    if (typeof u.mcqWinnerStarUntil === 'number') return u.mcqWinnerStarUntil > now;
    return false;
  };

  const UserCard = ({ u }: { u: any }) => (
    <div className="flex flex-col items-center group bg-[#1a1f26] border border-white/5 rounded-xl p-6 hover:border-white/20 transition-colors w-full">
      <Link to={\`/user/\${u.id}\`} className="mb-4 relative">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#2c3440] border-4 border-[#1a1f26] group-hover:border-[#38bdf8] transition-colors shadow-lg">
          <img 
            referrerPolicy="no-referrer" 
            src={u.photoURL || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${u.displayName || u.email || 'user'}&backgroundColor=4338ca\`} 
            alt={u.displayName || 'User'} 
            className="w-full h-full object-cover" 
          />
        </div>
      </Link>
      <Link to={\`/user/\${u.id}\`} className="flex items-center justify-center gap-1.5 w-full hover:text-[#40bcf4] transition-colors mb-1">
        <span className="text-white font-bold text-[15px] truncate max-w-full">{u.displayName || u.email?.split('@')[0] || 'Member'}</span>
        {isGoat(u) && (
          <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">GOAT</span>
        )}
      </Link>
      <p className="text-[12px] text-[#89a] mb-4">
        {u.stats?.watched || 0} films • {u.stats?.rated || 0} reviews
      </p>
      
      {u.commonCount > 0 && filterSameLikeYou && (
        <div className="mb-3 px-2 py-0.5 rounded bg-[#00e054]/20 text-[#00e054] text-[10px] font-bold">
          {u.commonCount} in common
        </div>
      )}

      {u.favoriteMovies && u.favoriteMovies.length > 0 && (
        <div className="flex gap-1 w-full mt-auto h-[75px] md:h-[90px]">
          {[0, 1, 2, 3].map(i => {
            const movie = u.favoriteMovies[i];
            const hasImage = movie && movie.posterPath && !movie.posterPath.includes('undefined');
            return (
              <div key={i} className="flex-1 bg-[#2c3440] rounded-[3px] overflow-hidden shadow-sm border border-white/5 relative">
                {hasImage ? (
                  <img 
                    src={movie.posterPath} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    alt="Poster" 
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-[#1f252d]"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white/20"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-[#2c3440] pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Members</h1>
          <p className="text-[#89a] text-sm mt-1">Film lovers, critics and friends — find popular members.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setFilterSameLikeYou(!filterSameLikeYou)}
            className={\`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors w-full sm:w-auto justify-center \${filterSameLikeYou ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8]' : 'border-white/10 bg-[#1a1f26] text-white hover:border-white/30'}\`}
          >
            <div className={\`w-4 h-4 rounded-sm border flex items-center justify-center \${filterSameLikeYou ? 'bg-[#38bdf8] border-[#38bdf8]' : 'border-white/40'}\`}>
              {filterSameLikeYou && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm font-medium whitespace-nowrap">Same Like You</span>
          </button>
          
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find a member..."
              className="w-full bg-[#1a1f26] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#38bdf8] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* FEATURED MEMBERS */}
      {!searchTerm && !filterSameLikeYou && (
        <div className="mb-12">
          <h2 className="text-[11px] uppercase tracking-widest text-[#9ab] font-bold mb-6 border-b border-[#2c3440] pb-2">Featured Members</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredMembers.map((u, i) => (
              <UserCard key={\`featured-\${u.id}-\${i}\`} u={u} />
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE REVIEWERS */}
      <div>
        <h2 className="text-[11px] uppercase tracking-widest text-[#9ab] font-bold mb-6 border-b border-[#2c3440] pb-2">
          {filterSameLikeYou ? "Similar Members" : searchTerm ? "Search Results" : "Active Reviewers"}
        </h2>
        
        {filterSameLikeYou && currentUserFavorites.length === 0 && (
          <div className="mb-6 p-4 bg-[#2c3440]/50 border border-white/10 rounded-lg text-[#89a] text-sm text-center">
            You need to rate at least 1 movie to find matches!
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayedUsers.map((u, i) => (
            <UserCard key={\`active-\${u.id}-\${i}\`} u={u} />
          ))}
          
          {displayedUsers.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#89a]">
              {filterSameLikeYou ? "No members found with similar top 4 movies." : "No members found matching your search."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Community.tsx', code);
