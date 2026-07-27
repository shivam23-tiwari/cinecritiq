with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

target = """              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">"""

replacement = """              </div>

              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Paste image URL here..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#E50914]"
                  value={customPosterUrlInput}
                  onChange={(e) => setCustomPosterUrlInput(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (customPosterUrlInput) {
                      handleSaveTmdbPoster(customPosterUrlInput);
                      setCustomPosterUrlInput("");
                    }
                  }}
                  className="px-4 py-2 bg-[#E50914] text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  Apply URL
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/pages/MovieDetails.tsx', 'w') as f:
        f.write(content)
    print("Input added")
else:
    print("Target not found")
