import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

old_cast = """      {/* Cast Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-lg font-semibold text-white mb-6">Top Cast</h2>
        <div className="flex flex-col md:flex-row md:overflow-x-auto gap-3 md:gap-5 pb-4 scrollbar-hide">
          {credits?.cast && credits.cast.length > 0 ? (
            credits.cast
              .slice(0, 15)
              .map((actor: any) => (
                <Link key={actor.id} to={`/person/${actor.id}`} state={{ activeRole: "Actor" }} className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-3 p-3 md:p-0 rounded-xl md:rounded-none bg-white/5 md:bg-transparent border border-white/10 md:border-transparent hover:border-white/30 md:hover:border-transparent hover:bg-white/10 md:hover:bg-transparent transition-colors cursor-pointer group w-full md:w-[150px] shrink-0">
                  <div className="w-12 h-12 md:w-full md:h-[225px] shrink-0 rounded-full md:rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative">"""

new_cast = """      {/* Cast Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-lg font-semibold text-white mb-6">Top Cast</h2>
        <div className="flex overflow-x-auto gap-3 md:gap-5 pb-4 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
          {credits?.cast && credits.cast.length > 0 ? (
            credits.cast
              .slice(0, 15)
              .map((actor: any) => (
                <Link key={actor.id} to={`/person/${actor.id}`} state={{ activeRole: "Actor" }} className="flex flex-col items-start gap-2 p-0 rounded-none bg-transparent border-transparent hover:border-transparent hover:bg-transparent transition-colors cursor-pointer group w-[100px] sm:w-[120px] md:w-[150px] shrink-0 snap-start">
                  <div className="w-full h-[150px] sm:h-[180px] md:h-[225px] shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative">"""

content = content.replace(old_cast, new_cast)

# Also fix the text centering for cast on mobile
old_cast_text = """                  <div className="flex-1 min-w-0 md:w-full">
                    <h4 className="text-white font-medium text-sm group-hover:text-[#E50914] transition-colors truncate">"""
new_cast_text = """                  <div className="w-full">
                    <h4 className="text-white font-medium text-xs md:text-sm group-hover:text-[#E50914] transition-colors truncate">"""

content = content.replace(old_cast_text, new_cast_text)

old_cast_char = """                    <p className="text-gray-500 text-xs mt-0.5 truncate">
                      {actor.character}
                    </p>
                  </div>
                </Link>"""
new_cast_char = """                    <p className="text-gray-500 text-[10px] md:text-xs mt-0.5 truncate">
                      {actor.character}
                    </p>
                  </div>
                </Link>"""
                
content = content.replace(old_cast_char, new_cast_char)

# Fix Seasons for TV Shows
old_seasons = """      {type === 'tv' && seasons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">Seasons</h2>
          <div className="flex flex-col md:flex-row md:overflow-x-auto gap-4 md:gap-5 pb-4 scrollbar-hide">
            {seasons.map((season) => (
              <div key={season.id} className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-3 p-3 md:p-0 rounded-xl md:rounded-none bg-white/5 md:bg-transparent border border-white/10 md:border-transparent hover:border-white/30 md:hover:border-transparent hover:bg-white/10 md:hover:bg-transparent transition-colors cursor-pointer group w-full md:w-[160px] shrink-0">
                <div className="w-16 h-24 md:w-full md:h-[240px] shrink-0 rounded-lg md:rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative">"""

new_seasons = """      {type === 'tv' && seasons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">Seasons</h2>
          <div className="flex overflow-x-auto gap-3 md:gap-5 pb-4 scrollbar-hide snap-x -mx-4 px-4 md:mx-0 md:px-0">
            {seasons.map((season) => (
              <div key={season.id} className="flex flex-col items-start gap-2 p-0 rounded-none bg-transparent border-transparent hover:border-transparent hover:bg-transparent transition-colors cursor-pointer group w-[110px] sm:w-[130px] md:w-[160px] shrink-0 snap-start">
                <div className="w-full h-[165px] sm:h-[195px] md:h-[240px] shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative">"""

content = content.replace(old_seasons, new_seasons)

old_seasons_text = """                <div className="flex-1 min-w-0 md:w-full">
                  <h4 className="text-white font-medium text-sm md:text-base group-hover:text-[#E50914] transition-colors truncate">"""
new_seasons_text = """                <div className="w-full">
                  <h4 className="text-white font-medium text-xs md:text-base group-hover:text-[#E50914] transition-colors truncate">"""
                  
content = content.replace(old_seasons_text, new_seasons_text)

old_seasons_eps = """                  <p className="text-gray-500 text-xs mt-1 truncate">
                    {season.episode_count} Episodes
                  </p>
                  {season.air_date && (
                    <p className="text-gray-600 text-xs mt-0.5 truncate">
                      {season.air_date.substring(0, 4)}
                    </p>
                  )}
                </div>
              </div>"""
new_seasons_eps = """                  <p className="text-gray-500 text-[10px] md:text-xs mt-1 truncate">
                    {season.episode_count} Episodes
                  </p>
                  {season.air_date && (
                    <p className="text-gray-600 text-[10px] md:text-xs mt-0.5 truncate">
                      {season.air_date.substring(0, 4)}
                    </p>
                  )}
                </div>
              </div>"""

content = content.replace(old_seasons_eps, new_seasons_eps)

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)
