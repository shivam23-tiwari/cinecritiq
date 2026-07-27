import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

old_buttons = """                {/* Buttons block */}
                <div className="flex flex-col gap-5 mt-6">
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <button
                      onClick={() => openTrailer(movie.id, type as "movie" | "tv", movie.title || movie.name, movie.release_date || movie.first_air_date)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-[#E50914] hover:bg-[#b90710] rounded font-bold transition-colors text-white text-[13px] md:text-[15px] min-w-[140px]"
                    >
                      <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Trailer
                    </button>
                    <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-[#2c2c2c] hover:bg-[#3c3c3c] rounded font-bold transition-colors border border-white/10 text-white text-[13px] md:text-[15px] min-w-[120px]">
                      <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Share
                    </button>
                  </div>
                  
                  {/* Actions Grid */}
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <button 
                      onClick={() => handleAction('watchlist')} 
                      className={`flex-1 sm:flex-none px-3 md:px-5 py-2.5 rounded font-bold transition-colors flex justify-center items-center gap-1.5 md:gap-2 text-[12px] md:text-[14px] min-w-[130px] ${inWatchlist ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                    >
                      {inWatchlist ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      Watchlist
                    </button>
                    <button 
                      onClick={() => handleAction('watched')} 
                      className={`flex-1 sm:flex-none px-3 md:px-5 py-2.5 rounded font-bold transition-colors flex justify-center items-center gap-1.5 md:gap-2 text-[12px] md:text-[14px] min-w-[120px] ${isWatched ? 'bg-[#0a4d2e] border border-transparent text-[#00e054] hover:bg-[#0c613a]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                    >
                      {isWatched ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      Watched
                    </button>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowRatingModal(true)} 
                        className={`w-10 h-10 md:w-11 md:h-11 rounded-full transition-all flex items-center justify-center shrink-0 ${userRating ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                        title="Rate"
                      >
                        <Star className={`w-4 h-4 md:w-4 md:h-4 ${userRating ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button 
                        onClick={() => {
                          setSelectedMovieForDiary(movie);
                          setShowAddDiaryModal(true);
                        }}
                        className={`w-10 h-10 md:w-11 md:h-11 rounded-full transition-all flex items-center justify-center shrink-0 ${inDiary ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                        title="Log in Diary"
                      >
                        <BookOpen className="w-4 h-4 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>"""

new_buttons = """                {/* Buttons block */}
                <div className="flex flex-col gap-3 md:gap-5 mt-6 clear-both">
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
                    <button
                      onClick={() => openTrailer(movie.id, type as "movie" | "tv", movie.title || movie.name, movie.release_date || movie.first_air_date)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-2 md:px-6 py-2.5 md:py-2.5 bg-[#E50914] hover:bg-[#b90710] rounded font-bold transition-colors text-white text-[13px] md:text-[15px] md:min-w-[140px]"
                    >
                      <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> Trailer
                    </button>
                    <button onClick={handleShare} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-2 md:px-6 py-2.5 md:py-2.5 bg-[#2c2c2c] hover:bg-[#3c3c3c] rounded font-bold transition-colors border border-white/10 text-white text-[13px] md:text-[15px] md:min-w-[120px]">
                      <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Share
                    </button>
                  </div>
                  
                  {/* Actions Grid */}
                  <div className="grid grid-cols-4 md:flex md:items-center gap-2 md:gap-3">
                    <button 
                      onClick={() => handleAction('watchlist')} 
                      className={`flex flex-col md:flex-row md:flex-none px-1 md:px-5 py-2 md:py-2.5 rounded font-bold transition-colors flex justify-center items-center gap-1 md:gap-2 text-[10px] md:text-[14px] md:min-w-[130px] ${inWatchlist ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                    >
                      {inWatchlist ? <Check className="w-4 h-4 md:w-4 md:h-4" /> : <Clock className="w-4 h-4 md:w-4 md:h-4" />}
                      <span>Watchlist</span>
                    </button>
                    <button 
                      onClick={() => handleAction('watched')} 
                      className={`flex flex-col md:flex-row md:flex-none px-1 md:px-5 py-2 md:py-2.5 rounded font-bold transition-colors flex justify-center items-center gap-1 md:gap-2 text-[10px] md:text-[14px] md:min-w-[120px] ${isWatched ? 'bg-[#0a4d2e] border border-transparent text-[#00e054] hover:bg-[#0c613a]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                    >
                      {isWatched ? <Check className="w-4 h-4 md:w-4 md:h-4" /> : <Eye className="w-4 h-4 md:w-4 md:h-4" />}
                      <span>Watched</span>
                    </button>
                    <button 
                      onClick={() => setShowRatingModal(true)} 
                      className={`flex flex-col md:flex-row md:flex-none px-1 md:w-11 md:h-11 md:px-0 py-2 md:py-0 md:rounded-full rounded transition-all flex items-center justify-center shrink-0 gap-1 md:gap-0 font-bold text-[10px] md:text-sm ${userRating ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                      title="Rate"
                    >
                      <Star className={`w-4 h-4 md:w-4 md:h-4 ${userRating ? 'fill-current' : ''}`} />
                      <span className="md:hidden">Rate</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedMovieForDiary(movie);
                        setShowAddDiaryModal(true);
                      }}
                      className={`flex flex-col md:flex-row md:flex-none px-1 md:w-11 md:h-11 md:px-0 py-2 md:py-0 md:rounded-full rounded transition-all flex items-center justify-center shrink-0 gap-1 md:gap-0 font-bold text-[10px] md:text-sm ${inDiary ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                      title="Log in Diary"
                    >
                      <BookOpen className="w-4 h-4 md:w-4 md:h-4" />
                      <span className="md:hidden">Diary</span>
                    </button>
                  </div>"""

content = content.replace(old_buttons, new_buttons)
with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)
