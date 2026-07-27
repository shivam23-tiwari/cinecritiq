import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from '../lib/firestore-wrapper';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { Search, Check, Eye, Star, Heart, LayoutGrid } from 'lucide-react';
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
          
          fetchedUsers.push({
            id: userId,
            ...data,
            stats: data.stats || { watched: 0, rated: 0 },
            favoriteMovies: data.topFavorites || []
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
        fm && fm.id && currentUserFavorites.some((cf: any) => cf && cf.id && String(cf.id) === String(fm.id))
      );
      return { ...u, commonCount: commonMovies.length, commonMovies };
    })
    .filter(u => {
      const name = (u.displayName || u.email || 'user').toLowerCase();
      if (!name.includes(searchTerm.toLowerCase())) return false;
      if (filterSameLikeYou && u.commonCount === 0) return false;
      return true;
    })
    .sort((a, b) => ((b.stats?.rated || 0) + (b.stats?.watched || 0)) - ((a.stats?.rated || 0) + (a.stats?.watched || 0)));

  const featuredMembers = [...users]
    .sort((a, b) => ((b.stats?.rated || 0) + (b.stats?.watched || 0)) - ((a.stats?.rated || 0) + (a.stats?.watched || 0)))
    .slice(0, 4);

  const isGoat = (u: any) => {
    if (!u.mcqWinnerStarUntil) return false;
    const now = Date.now();
    if (typeof u.mcqWinnerStarUntil.toMillis === 'function') return u.mcqWinnerStarUntil.toMillis() > now;
    if (typeof u.mcqWinnerStarUntil.getTime === 'function') return u.mcqWinnerStarUntil.getTime() > now;
    if (typeof u.mcqWinnerStarUntil === 'number') return u.mcqWinnerStarUntil > now;
    return false;
  };

  const hqMembers = users.filter(u => u.badges?.includes('Admin') || u.badges?.includes('OG Member') || isGoat(u)).slice(0, 12);
  if (hqMembers.length === 0) hqMembers.push(...users.slice(0, 12));

  const ActiveReviewerCard = ({ u }: { u: any }) => (
    <div className="flex flex-col items-center group bg-[#1a1f26] border border-white/5 rounded-xl p-6 hover:border-white/20 transition-colors w-full h-full">
      <Link to={`/user/${u.id}`} className="mb-4 relative">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#2c3440] border-4 border-[#1a1f26] group-hover:border-[#38bdf8] transition-colors shadow-lg">
          <img 
            referrerPolicy="no-referrer" 
            src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.displayName || u.email || 'user'}&backgroundColor=4338ca`} 
            alt={u.displayName || 'User'} 
            className="w-full h-full object-cover" 
          />
        </div>
      </Link>
      <Link to={`/user/${u.id}`} className="flex items-center justify-center gap-1.5 w-full hover:text-[#40bcf4] transition-colors mb-1">
        <span className="text-white font-bold text-[15px] truncate max-w-full">{u.displayName || u.email?.split('@')[0] || 'Member'}</span>
        {isGoat(u) && (
          <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">GOAT</span>
        )}
      </Link>
      <p className="text-[12px] text-[#89a] mb-2">
        {u.stats?.watched || 0} films • {u.stats?.rated || 0} reviews
      </p>
      {u.favoriteMovies && u.favoriteMovies.length > 0 && (
        <div className="flex gap-1 w-full mt-auto h-[75px] md:h-[90px]">
          {[0, 1, 2, 3].map(i => {
            const movie = u.favoriteMovies[i];
            const hasImage = movie && movie.posterPath && !movie.posterPath.includes('undefined');
            return (
              <div key={i} className="flex-1 bg-[#2c3440] rounded-[3px] overflow-hidden shadow-sm border border-white/5 relative">
                {hasImage ? (
                  <img 
                    src={movie.posterPath.startsWith('http') ? movie.posterPath : getImageUrl(movie.posterPath, 'w200')} 
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


  const SimilarUserCard = ({ u }: { u: any }) => (
    <div className="flex py-6 group gap-4 items-start border-b border-white/5 last:border-0 w-full overflow-hidden">
      <Link to={`/user/${u.id}`} className="shrink-0 mt-1">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2c3440] border border-white/10 group-hover:border-[#38bdf8] transition-colors">
          <img 
             referrerPolicy="no-referrer"
             src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.displayName || u.email || 'user'}&backgroundColor=4338ca`}
             alt={u.displayName || 'User'}
             className="w-full h-full object-cover"
           />
        </div>
      </Link>
      
      <div className="flex-1 min-w-0">
         <div className="flex flex-row flex-wrap items-start justify-between gap-2">
            <div>
               <Link to={`/user/${u.id}`} className="text-white font-bold text-[16px] hover:text-[#40bcf4] transition-colors truncate block mb-1">
                  {u.displayName || u.email?.split('@')[0] || 'Member'}
               </Link>
               <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[12px] text-[#89a]">{u.stats?.rated || 0} reviews</span>
                  {u.commonCount > 0 && filterSameLikeYou && (
                     <div className="px-2 py-0.5 rounded bg-[#00e054]/20 text-[#00e054] text-[10px] font-bold">
                       Same Like You! ({u.commonCount} in common)
                     </div>
                  )}
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-[#89a] text-xs sm:mt-1 shrink-0 mb-3 sm:mb-0">
               <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" title="Watched"><Eye className="w-4 h-4 text-green-500" /> {u.stats?.watched || 0}</div>
               <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" title="Lists"><LayoutGrid className="w-4 h-4 text-blue-500" /> {u.stats?.rated || 0}</div>
               <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" title="Likes"><Heart className="w-4 h-4 text-orange-500" /> {u.favoriteMovies?.length || 0}</div>
            </div>
         </div>
         {u.favoriteMovies && u.favoriteMovies.length > 0 && (
            <div className="grid grid-cols-4 gap-1 h-[70px] w-[190px] max-w-full">
              {[0, 1, 2, 3].map(i => {
                const movie = u.favoriteMovies[i];
                const hasImage = movie && movie.posterPath && !movie.posterPath.includes('undefined');
                return (
                  <div key={i} className="w-full h-full bg-[#2c3440] rounded-[3px] overflow-hidden shadow-sm border border-white/5 relative block">
                    {hasImage ? (
                      <Link to={`/movie/${movie.id}`} className="block w-full h-full hover:border-white transition-colors border border-transparent">
                        <img 
                           src={movie.posterPath.startsWith('http') ? movie.posterPath : getImageUrl(movie.posterPath, 'w200')}
                           className="absolute inset-0 w-full h-full object-cover"
                           referrerPolicy="no-referrer"
                          alt="Poster" 
                         />
                      </Link>
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-[#1f252d]"></div>
                    )}
                  </div>
                );
              })}
            </div>
         )}
      </div>
    </div>
  );

  const UserCard = ({ u }: { u: any }) => (
    <div className="flex flex-col items-center group bg-[#1a1f26] border border-white/5 rounded-xl p-6 hover:border-white/20 transition-colors w-full h-full">
      <Link to={`/user/${u.id}`} className="mb-4 relative">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#2c3440] border-4 border-[#1a1f26] group-hover:border-[#38bdf8] transition-colors shadow-lg">
          <img 
            referrerPolicy="no-referrer" 
            src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.displayName || u.email || 'user'}&backgroundColor=4338ca`} 
            alt={u.displayName || 'User'} 
            className="w-full h-full object-cover" 
          />
        </div>
      </Link>
      <Link to={`/user/${u.id}`} className="flex items-center justify-center gap-1.5 w-full hover:text-[#40bcf4] transition-colors mb-1">
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
                    src={movie.posterPath.startsWith('http') ? movie.posterPath : getImageUrl(movie.posterPath, 'w200')} 
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


  let activeReviewersList = displayedUsers;
  if (!searchTerm && !filterSameLikeYou) {
    activeReviewersList = [...displayedUsers]
      .sort((a, b) => ((b.stats?.rated || 0) + (b.stats?.watched || 0)) - ((a.stats?.rated || 0) + (a.stats?.watched || 0)))
      .slice(0, 4);
  }

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
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors w-full sm:w-auto justify-center ${filterSameLikeYou ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8]' : 'border-white/10 bg-[#1a1f26] text-white hover:border-white/30'}`}
          >
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${filterSameLikeYou ? 'bg-[#38bdf8] border-[#38bdf8]' : 'border-white/40'}`}>
              {filterSameLikeYou && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm font-medium whitespace-nowrap">Similar</span>
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
          <h2 className="text-[11px] uppercase tracking-widest text-[#9ab] font-bold mb-4 border-b border-[#2c3440] pb-2">Featured Members</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredMembers.map((u, i) => (
              <UserCard key={`featured-${u.id}-${i}`} u={u} />
            ))}
          </div>
        </div>
      )}

      {filterSameLikeYou ? (
         <div className="flex flex-col lg:flex-row gap-8 mt-6 w-full">
            <div className="flex-1 min-w-0 w-full">
               <div className="bg-[#1a1f26] border border-white/5 rounded-xl p-4 mb-4 text-[#89a] text-sm">
                  Showing members who share 3 or 4 of their top 4 best movies with you.
               </div>
               
               {currentUserFavorites.length === 0 && (
                 <div className="mb-6 p-4 bg-[#2c3440]/50 border border-white/10 rounded-lg text-[#89a] text-sm text-center">
                   You need to rate at least 1 movie to find matches!
                 </div>
               )}
               
               <div className="flex flex-col">
                  {activeReviewersList.map((u, i) => <SimilarUserCard key={`similar-${u.id}-${i}`} u={u} />)}
                  {activeReviewersList.length === 0 && currentUserFavorites.length > 0 && (
                     <div className="py-12 text-center text-[#89a]">
                        No members found with similar top 4 movies.
                     </div>
                  )}
               </div>
            </div>
            
            <div className="w-full lg:w-[280px] shrink-0">
               <div className="flex items-center justify-between mb-4 border-b border-[#2c3440] pb-2">
                  <h2 className="text-[11px] uppercase tracking-widest text-[#9ab] font-bold">HQ Members</h2>
                  <Link to="#" className="text-[10px] text-white/50 hover:text-white uppercase tracking-widest">ALL</Link>
               </div>
               <div className="flex flex-wrap gap-2">
                  {hqMembers.map((u, i) => (
                     <Link to={`/user/${u.id}`} key={`hq-similar-${u.id}-${i}`} title={u.displayName || u.email} className="w-10 h-10 group rounded-full overflow-hidden border border-white/10 hover:border-white transition-colors">
                        <img 
                           referrerPolicy="no-referrer"
                           src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.displayName || u.email || 'user'}&backgroundColor=4338ca`}
                           alt={u.displayName || 'User'}
                           className="w-full h-full object-cover"
                        />
                     </Link>
                  ))}
               </div>
            </div>
         </div>
      ) : (
      <div className="mb-12">
        <h2 className="text-[11px] uppercase tracking-widest text-[#9ab] font-bold mb-6 border-b border-[#2c3440] pb-2">
          {searchTerm ? "Search Results" : "Active Reviewers"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {activeReviewersList.map((u, i) => (
            (!searchTerm) 
              ? <ActiveReviewerCard key={`active-${u.id}-${i}`} u={u} />
              : <UserCard key={`active-${u.id}-${i}`} u={u} />
          ))}
          
          {activeReviewersList.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#89a]">
              No members found matching your search.
            </div>
          )}
        </div>
      </div>
      )}
      
      {/* HQ MEMBERS */}
      {!searchTerm && !filterSameLikeYou && (
        <div>
          <h2 className="text-[11px] uppercase tracking-widest text-[#9ab] font-bold mb-6 border-b border-[#2c3440] pb-2">HQ Members</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
            {hqMembers.map((u, i) => (
              <Link to={`/user/${u.id}`} key={`hq-${u.id}-${i}`} title={u.displayName || u.email} className="group">
                <img 
                  referrerPolicy="no-referrer" 
                  src={u.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.displayName || u.email || 'user'}&backgroundColor=4338ca`}
                  alt={u.displayName || 'User'}
                  className="w-full aspect-square rounded-full object-cover border-2 border-white/10 group-hover:border-[#40bcf4] transition-colors shadow-lg"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}