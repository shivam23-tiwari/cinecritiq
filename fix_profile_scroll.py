import re

with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

# Fix Profile Tabs
old_tabs = """      {/* Profile Tabs */}
      <div className="mb-8 border-b border-white/10 overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex gap-2 pb-px min-w-max">"""
new_tabs = """      {/* Profile Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-px mb-8 border-b border-white/10 -mx-6 px-6 md:mx-0 md:px-0">"""
content = content.replace(old_tabs, new_tabs)

# We need to remove the closing </div> for the old flex container in tabs
old_tabs_close = """            </button>
          ))}
        </div>
      </div>"""
new_tabs_close = """            </button>
          ))}
      </div>"""
content = content.replace(old_tabs_close, new_tabs_close)

# Add shrink-0 to tab buttons
content = content.replace(
    'className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm font-medium transition-colors border-b-2',
    'className={`shrink-0 flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm font-medium transition-colors border-b-2'
)

# Fix Top 4
old_top4 = """            <div className="overflow-x-auto scrollbar-hide py-2 -mx-6 px-6 md:mx-0 md:px-0">
              <div className="flex gap-3 md:gap-4" style={{ width: "max-content" }}>
              {slots.map(index => {"""
new_top4 = """            <div className="flex overflow-x-auto scrollbar-hide gap-3 md:gap-4 py-2 -mx-6 px-6 md:mx-0 md:px-0 snap-x">
              {slots.map(index => {"""
content = content.replace(old_top4, new_top4)

old_top4_movie = """className="relative group rounded-xl overflow-hidden aspect-[2/3] border border-white/10 hover:border-[#E50914] transition-colors w-[95px] sm:w-[140px] md:w-[180px]\""""
new_top4_movie = """className="shrink-0 relative group rounded-xl overflow-hidden aspect-[2/3] border border-white/10 hover:border-[#E50914] transition-colors w-[110px] sm:w-[140px] md:w-[180px] snap-start\""""
content = content.replace(old_top4_movie, new_top4_movie)

old_top4_empty = """className="flex flex-col items-center justify-center rounded-xl overflow-hidden aspect-[2/3] border border-dashed border-white/20 bg-white/5 text-white/30 w-[95px] sm:w-[140px] md:w-[180px]\""""
new_top4_empty = """className="shrink-0 flex flex-col items-center justify-center rounded-xl overflow-hidden aspect-[2/3] border border-dashed border-white/20 bg-white/5 text-white/30 w-[110px] sm:w-[140px] md:w-[180px] snap-start\""""
content = content.replace(old_top4_empty, new_top4_empty)

old_top4_close = """              })}
              </div>
            </div>"""
new_top4_close = """              })}
            </div>"""
content = content.replace(old_top4_close, new_top4_close)

# Fix Recent Activity
old_recent = """              <div className="overflow-x-auto scrollbar-hide py-8 -mx-6 px-6 md:mx-0 md:px-0">
                <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
                  {watched.slice(0, 15).map((movie, idx) => (
                    <div key={`recent-${movie.id}-${idx}`} className="w-[95px] sm:w-[160px] md:w-[200px]">"""
new_recent = """              <div className="flex overflow-x-auto scrollbar-hide gap-3 md:gap-4 py-8 -mx-6 px-6 md:mx-0 md:px-0 snap-x">
                  {watched.slice(0, 15).map((movie, idx) => (
                    <div key={`recent-${movie.id}-${idx}`} className="shrink-0 w-[110px] sm:w-[140px] md:w-[180px] snap-start">"""
content = content.replace(old_recent, new_recent)

old_recent_close = """                  ))}
                </div>
              </div>"""
new_recent_close = """                  ))}
              </div>"""
content = content.replace(old_recent_close, new_recent_close)

# Fix grid for Ratings and Films
old_grid = """<div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-4 md:gap-5">"""
new_grid = """<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">"""
content = content.replace(old_grid, new_grid)

# Fix Profile Header
old_header = """        <div className="flex flex-row items-center gap-4 md:gap-6 mb-12 p-4 md:p-8 bg-black/40 rounded-xl border border-white/5 relative shadow-xl">
           <button
             onClick={() => setIsEditing(true)}
             className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all rounded-full border border-white/10"
           >
             <Settings className="w-5 h-5" />
           </button>
           <button
              onClick={handleClearPosters}
              className="absolute top-12 right-2 md:top-4 md:right-16 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
           >
              Reset Posters
           </button>
              
           <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-red-600 shrink-0 shadow-lg bg-neutral-900">
              {profileData.photoURL ? <img referrerPolicy="no-referrer" src={profileData.photoURL} alt={profileData.displayName || 'User'} className="w-full h-full object-cover"/> : <img referrerPolicy="no-referrer" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.displayName || user.email || 'user'}`} alt="User" className="w-full h-full object-cover" />}
           </div>
              
           <div className="text-left flex-1">"""

new_header = """        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-12 p-4 md:p-8 bg-black/40 rounded-xl border border-white/5 relative shadow-xl overflow-hidden">
           <div className="flex w-full sm:w-auto justify-between items-start">
             <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-red-600 shrink-0 shadow-lg bg-neutral-900">
                {profileData.photoURL ? <img referrerPolicy="no-referrer" src={profileData.photoURL} alt={profileData.displayName || 'User'} className="w-full h-full object-cover"/> : <img referrerPolicy="no-referrer" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.displayName || user.email || 'user'}`} alt="User" className="w-full h-full object-cover" />}
             </div>
             <div className="flex sm:hidden flex-col gap-2 items-end">
               <button
                 onClick={() => setIsEditing(true)}
                 className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all rounded-full border border-white/10"
               >
                 <Settings className="w-5 h-5" />
               </button>
               <button
                  onClick={handleClearPosters}
                  className="px-2 py-1 text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-colors"
               >
                  Reset Posters
               </button>
             </div>
           </div>
           
           <div className="hidden sm:flex absolute top-4 right-4 flex-col gap-2 items-end">
             <button
               onClick={() => setIsEditing(true)}
               className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all rounded-full border border-white/10"
             >
               <Settings className="w-5 h-5" />
             </button>
             <button
                onClick={handleClearPosters}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
             >
                Reset Posters
             </button>
           </div>
              
           <div className="text-left flex-1 min-w-0 mt-2 sm:mt-0 w-full">"""

content = content.replace(old_header, new_header)

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(content)
