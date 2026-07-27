import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

# Add state
if 'const [showFullOverview, setShowFullOverview] = useState(false);' not in content:
    content = content.replace(
        'const [showDiaryModal, setShowDiaryModal] = useState(false);',
        'const [showDiaryModal, setShowDiaryModal] = useState(false);\n  const [showFullOverview, setShowFullOverview] = useState(false);'
    )

# Replace overview
old_overview = """                <div className="prose prose-invert max-w-3xl mb-10 text-[#a3a3a3] text-lg leading-relaxed">
                  <p>{movie.overview || "No overview available."}</p>
                </div>"""

new_overview = """                <div className="prose prose-invert max-w-3xl mb-8 md:mb-10 text-[#a3a3a3] text-[15px] md:text-lg leading-relaxed">
                  <p className={!showFullOverview ? "line-clamp-4 md:line-clamp-none" : ""}>
                    {movie.overview || "No overview available."}
                  </p>
                  {(movie.overview || "").length > 180 && (
                    <button 
                      onClick={() => setShowFullOverview(!showFullOverview)} 
                      className="text-[#E50914] text-[13px] font-bold mt-1 md:hidden hover:underline"
                    >
                      {showFullOverview ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </div>"""

content = content.replace(old_overview, new_overview)

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)
