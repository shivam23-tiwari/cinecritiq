import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

old_where_to_watch = """                  {/* Where to Watch */}
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
                  )}"""

# Replace the old where to watch with nothing
content = content.replace(old_where_to_watch, "")

new_where_to_watch_section = """      {/* Where to Watch Section */}
      {providers && (providers.flatrate || providers.rent || providers.buy) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-8 border-t border-white/5 mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-8 md:mb-12">Where to Watch</h2>
          
          <div className="space-y-10 md:space-y-12">
            {providers.flatrate && (
              <div>
                <h3 className="text-sm md:text-base text-gray-400 uppercase tracking-wider mb-6">STREAM</h3>
                <div className="flex flex-wrap gap-6 md:gap-10">
                  {providers.flatrate.map((provider: any) => (
                    <div key={provider.provider_id} className="flex flex-col items-center gap-3 w-[60px] md:w-[80px]">
                      <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl shadow-lg" title={provider.provider_name} />
                      <span className="text-[10px] md:text-xs text-gray-400 text-center truncate w-full">{provider.provider_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {providers.rent && (
              <div>
                <h3 className="text-sm md:text-base text-gray-400 uppercase tracking-wider mb-6">RENT</h3>
                <div className="flex flex-wrap gap-6 md:gap-10">
                  {providers.rent.map((provider: any) => (
                    <div key={provider.provider_id} className="flex flex-col items-center gap-3 w-[60px] md:w-[80px]">
                      <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl shadow-lg" title={provider.provider_name} />
                      <span className="text-[10px] md:text-xs text-gray-400 text-center truncate w-full">{provider.provider_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {providers.buy && (
              <div>
                <h3 className="text-sm md:text-base text-gray-400 uppercase tracking-wider mb-6">BUY</h3>
                <div className="flex flex-wrap gap-6 md:gap-10">
                  {providers.buy.map((provider: any) => (
                    <div key={provider.provider_id} className="flex flex-col items-center gap-3 w-[60px] md:w-[80px]">
                      <img src={getImageUrl(provider.logo_path, 'w92')} alt={provider.provider_name} className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl shadow-lg" title={provider.provider_name} />
                      <span className="text-[10px] md:text-xs text-gray-400 text-center truncate w-full">{provider.provider_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-12 text-sm text-gray-600">
            Powered by JustWatch
          </div>
        </section>
      )}

      {/* Cast Section */}"""

content = content.replace("      {/* Cast Section */}", new_where_to_watch_section)

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)
