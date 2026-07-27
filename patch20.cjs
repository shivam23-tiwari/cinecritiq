const fs = require('fs');
let code = fs.readFileSync('src/pages/Community.tsx', 'utf8');

// 1. Add LayoutGrid import
if (!code.includes('LayoutGrid')) {
  code = code.replace("import { Search, Check, Eye, Star, Heart } from 'lucide-react';", "import { Search, Check, Eye, Star, Heart, LayoutGrid } from 'lucide-react';");
}

// 2. Add SimilarUserCard component
const similarUserCard = `
  const SimilarUserCard = ({ u }: { u: any }) => (
    <div className="flex py-6 group gap-4 items-start border-b border-white/5 last:border-0">
      <Link to={\`/user/\${u.id}\`} className="shrink-0 mt-1">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2c3440] border border-white/10 group-hover:border-[#38bdf8] transition-colors">
          <img 
             referrerPolicy="no-referrer"
             src={u.photoURL || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${u.displayName || u.email || 'user'}&backgroundColor=4338ca\`}
             alt={u.displayName || 'User'}
             className="w-full h-full object-cover"
           />
        </div>
      </Link>
      
      <div className="flex-1 min-w-0">
         <Link to={\`/user/\${u.id}\`} className="text-white font-bold text-[16px] hover:text-[#40bcf4] transition-colors truncate block mb-1">
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
         {u.favoriteMovies && u.favoriteMovies.length > 0 && (
            <div className="flex gap-1 h-[70px]">
              {[0, 1, 2, 3].map(i => {
                const movie = u.favoriteMovies[i];
                const hasImage = movie && movie.posterPath && !movie.posterPath.includes('undefined');
                return (
                  <div key={i} className="w-[47px] bg-[#2c3440] rounded-[3px] overflow-hidden shadow-sm border border-white/5 relative block">
                    {hasImage ? (
                      <Link to={\`/movie/\${movie.id}\`} className="block w-full h-full hover:border-white transition-colors border border-transparent">
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

      <div className="flex items-center gap-4 text-[#89a] text-xs mt-1 shrink-0">
         <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" title="Watched"><Eye className="w-4 h-4 text-green-500" /> {u.stats?.watched || 0}</div>
         <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" title="Lists"><LayoutGrid className="w-4 h-4 text-blue-500" /> {u.stats?.rated || 0}</div>
         <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" title="Likes"><Heart className="w-4 h-4 text-orange-500" /> {u.favoriteMovies?.length || 0}</div>
      </div>
    </div>
  );
`;

const insertAfter = `  const UserCard = ({ u }: { u: any }) => (`;
code = code.replace(insertAfter, similarUserCard + "\n" + insertAfter);

// 3. Change filterSameLikeYou button text
code = code.replace(
  '<span className="text-sm font-medium whitespace-nowrap">Same Like You</span>',
  '<span className="text-sm font-medium whitespace-nowrap">Similar</span>'
);

// 4. Update the structure when filterSameLikeYou is true
const newLayout = `      {filterSameLikeYou ? (
         <div className="flex flex-col lg:flex-row gap-8 mt-6">
            <div className="flex-1">
               <div className="bg-[#1a1f26] border border-white/5 rounded-xl p-4 mb-4 text-[#89a] text-sm">
                  Showing members who share 3 or 4 of their top 4 best movies with you.
               </div>
               
               {currentUserFavorites.length === 0 && (
                 <div className="mb-6 p-4 bg-[#2c3440]/50 border border-white/10 rounded-lg text-[#89a] text-sm text-center">
                   You need to rate at least 1 movie to find matches!
                 </div>
               )}
               
               <div className="flex flex-col">
                  {activeReviewersList.map((u, i) => <SimilarUserCard key={\`similar-\${u.id}-\${i}\`} u={u} />)}
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
                     <Link to={\`/user/\${u.id}\`} key={\`hq-similar-\${u.id}-\${i}\`} title={u.displayName || u.email} className="w-10 h-10 group rounded-full overflow-hidden border border-white/10 hover:border-white transition-colors">
                        <img 
                           referrerPolicy="no-referrer"
                           src={u.photoURL || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${u.displayName || u.email || 'user'}&backgroundColor=4338ca\`}
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
              ? <ActiveReviewerCard key={\`active-\${u.id}-\${i}\`} u={u} />
              : <UserCard key={\`active-\${u.id}-\${i}\`} u={u} />
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
      {!searchTerm && !filterSameLikeYou && (`;

const replaceTarget = `      {/* ACTIVE REVIEWERS */}
      <div className="mb-12">
        <h2 className="text-[11px] uppercase tracking-widest text-[#9ab] font-bold mb-6 border-b border-[#2c3440] pb-2">
          {filterSameLikeYou ? "Similar Members" : searchTerm ? "Search Results" : "Active Reviewers"}
        </h2>
        
        {filterSameLikeYou && currentUserFavorites.length === 0 && (
          <div className="mb-6 p-4 bg-[#2c3440]/50 border border-white/10 rounded-lg text-[#89a] text-sm text-center">
            You need to rate at least 1 movie to find matches!
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {activeReviewersList.map((u, i) => (
            (!searchTerm && !filterSameLikeYou) 
              ? <ActiveReviewerCard key={\`active-\${u.id}-\${i}\`} u={u} />
              : <UserCard key={\`active-\${u.id}-\${i}\`} u={u} />
          ))}
          
          {activeReviewersList.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#89a]">
              {filterSameLikeYou ? "No members found with similar top 4 movies." : "No members found matching your search."}
            </div>
          )}
        </div>
      </div>

      {/* HQ MEMBERS */}
      {!searchTerm && !filterSameLikeYou && (`;

code = code.replace(replaceTarget, newLayout);
fs.writeFileSync('src/pages/Community.tsx', code);
console.log('Patched Layout in Community');
