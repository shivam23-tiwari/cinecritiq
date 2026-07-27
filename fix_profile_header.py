import re

with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

new_header = """
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 p-8 bg-black/40 rounded-xl border border-white/5 relative shadow-xl">
           <button
             onClick={() => setIsEditing(true)}
             className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all rounded-full border border-white/10"
           >
             <Settings className="w-5 h-5" />
           </button>
           <button
              onClick={handleClearPosters}
              className="absolute top-16 right-4 md:top-4 md:right-16 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm"
           >
              Reset Posters
           </button>
           
           <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-red-600 shrink-0 shadow-lg bg-neutral-900">
              {profileData.photoURL ? <img referrerPolicy="no-referrer" src={profileData.photoURL} alt={profileData.displayName || 'User'} className="w-full h-full object-cover"/> : <img referrerPolicy="no-referrer" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.displayName || user.email || 'user'}`} alt="User" className="w-full h-full object-cover" />}
           </div>
           
           <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {profileData.displayName || 'shivam'}
                </h1>
                
                {(profileData.mcqWinnerStarUntil && (
                  (typeof profileData.mcqWinnerStarUntil.toMillis === 'function' && profileData.mcqWinnerStarUntil.toMillis() > Date.now()) ||
                  (typeof profileData.mcqWinnerStarUntil.getTime === 'function' && profileData.mcqWinnerStarUntil.getTime() > Date.now()) ||
                  (typeof profileData.mcqWinnerStarUntil === 'number' && profileData.mcqWinnerStarUntil > Date.now())
                )) && (
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded font-bold uppercase tracking-wider" >
                    GOAT
                  </span>
                )}
                
                {!profileData.isPremium ? (
                  <button 
                    onClick={() => setShowPremiumModal(true)}
                    className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B59410] text-black text-xs font-bold rounded-full uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-1"
                  >
                    <Crown className="w-3 h-3" /> Go to Premium
                  </button>
                ) : (
                  <span className="text-xs px-2 py-1 bg-[#2C85D8] text-white font-bold rounded uppercase tracking-widest shadow-lg flex items-center gap-1">
                    Patron
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-2 mt-2 mb-4">
                {(profileData.email || user?.email) && <div className="text-white/60 text-base">{profileData.email || user?.email}</div>}
                
                {profileData.instagramUsername && (
                  <a 
                    href={`https://instagram.com/${profileData.instagramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center md:justify-start gap-2 text-[#E1306C] text-base font-medium hover:text-[#c1265b] transition-colors"
                  >
                    <Instagram className="w-4 h-4" /> 
                    <span>@{profileData.instagramUsername?.replace('@', '')}</span>
                  </a>
                )}
                
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm">{followersCount}</span>
                    <span className="text-white/50 text-sm">Followers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm">{followingCount}</span>
                    <span className="text-white/50 text-sm">Following</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm">{userPosts.length}</span>
                    <span className="text-white/50 text-sm">Posts</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                   <div className="flex items-center gap-1.5">
                      <span className="text-white/50 text-sm">Status:</span>
                      <span className={`text-sm font-bold ${profileData.isPremium ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                         {profileData.isPremium ? 'Pro State' : 'Normal State'}
                      </span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-white/50 text-sm">Activity Level:</span>
                      <div className="flex">
                         {[1,2,3,4,5].map(star => (
                           <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.min(5, Math.ceil((watched.length + ratings.length) / 5)) ? 'text-[#E50914] fill-[#E50914]' : 'text-white/20'}`} />
                         ))}
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>
"""

pattern = re.compile(r'\{!isEditing \? \([\s\S]*?\) : \(', re.MULTILINE)
matches = list(pattern.finditer(content))

if len(matches) > 0:
    new_content = content[:matches[0].start()] + "{!isEditing ? (\n" + new_header + "      ) : (" + content[matches[0].end():]
    with open('src/pages/Profile.tsx', 'w') as f:
        f.write(new_content)

