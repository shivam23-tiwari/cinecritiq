import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

# Replace action buttons block to be more mobile friendly
old_buttons = """                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => openTrailer(movie.id, type as "movie" | "tv", movie.title || movie.name, movie.release_date || movie.first_air_date)}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#E50914] hover:bg-[#b90710] rounded font-bold transition-colors text-white w-full sm:w-auto text-[15px]"
                    >
                      <Play className="w-5 h-5 fill-current" /> Watch Trailer
                    </button>
                    <button onClick={handleShare} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2c2c2c] hover:bg-[#3c3c3c] rounded font-bold transition-colors border border-white/10 text-white w-full sm:w-auto text-[15px]">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                  
                  {/* Actions Grid */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button 
                      onClick={() => handleAction('watchlist')} 
                      className={`px-5 py-2.5 rounded font-bold transition-colors flex items-center gap-2 text-[14px] ${inWatchlist ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                    >
                      {inWatchlist ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </button>
                    <button 
                      onClick={() => handleAction('watched')} 
                      className={`px-5 py-2.5 rounded font-bold transition-colors flex items-center gap-2 text-[14px] ${isWatched ? 'bg-[#0a4d2e] border border-transparent text-[#00e054] hover:bg-[#0c613a]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                    >
                      {isWatched ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {isWatched ? 'Watched' : 'Watched'}
                    </button>
                    <button 
                      onClick={() => setShowRatingModal(true)} 
                      className={`w-11 h-11 rounded-full transition-all flex items-center justify-center ${userRating ? 'bg-[#2c2c2c] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                      title="Rate"
                    >
                      <Star className={`w-4 h-4 ${userRating ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => setShowDiaryModal(true)} 
                      className={`w-11 h-11 rounded-full transition-all flex items-center justify-center ${diaryEntry ? 'bg-[#2c2c2c] border border-purple-500/50 text-purple-400 hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                      title="Log to Diary"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>"""

new_buttons = """                <div className="flex flex-col gap-5 mt-6">
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
                        onClick={() => setShowDiaryModal(true)} 
                        className={`w-10 h-10 md:w-11 md:h-11 rounded-full transition-all flex items-center justify-center shrink-0 ${diaryEntry ? 'bg-[#2c2c2c] border border-purple-500/50 text-purple-400 hover:bg-[#3c3c3c]' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#2c2c2c] text-white'}`}
                        title="Log to Diary"
                      >
                        <BookOpen className="w-4 h-4 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Where to Watch */}
                  {providers && (providers.flatrate || providers.rent || providers.buy) && (
                    <div className="mt-4 bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl">
                      <h3 className="text-xs md:text-sm font-bold text-white mb-3">Where to Watch</h3>
                      {providers.flatrate && (
                        <div className="mb-3">
                          <span className="text-[10px] md:text-xs text-white/50 uppercase tracking-wider block mb-2">Stream</span>
                          <div className="flex flex-wrap gap-2">
                            {providers.flatrate.map((provider: any) => (
                              <img key={provider.provider_id} src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} className="w-8 h-8 md:w-10 md:h-10 rounded-lg" title={provider.provider_name} />
                            ))}
                          </div>
                        </div>
                      )}
                      {(providers.rent || providers.buy) && (
                        <div>
                          <span className="text-[10px] md:text-xs text-white/50 uppercase tracking-wider block mb-2">Rent / Buy</span>
                          <div className="flex flex-wrap gap-2">
                            {((providers.rent || providers.buy) as any[]).reduce((unique: any[], item: any) => unique.find(x => x.provider_id === item.provider_id) ? unique : [...unique, item], []).map((provider: any) => (
                              <img key={provider.provider_id} src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} className="w-8 h-8 md:w-10 md:h-10 rounded-lg" title={provider.provider_name} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>"""

new_content = content.replace(old_buttons, new_buttons)

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(new_content)
