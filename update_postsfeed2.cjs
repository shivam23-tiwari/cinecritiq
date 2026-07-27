const fs = require('fs');
let content = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');

content = content.replace(
  '{selectedMovie && (',
  '{selectedMovies.length > 0 && ('
);
content = content.replace(
  '<div className="relative w-24 h-36 rounded-lg overflow-hidden border border-white/10 mt-2 mb-4">',
  '<div className="flex gap-2 mt-2 mb-4 flex-wrap">'
);
content = content.replace(
  '<img src={getImageUrl(selectedMovie.poster_path, \'w154\')} alt="Selected" className="w-full h-full object-cover" />',
  `{selectedMovies.map(sm => (
      <div key={sm.id} className="relative w-20 h-28 rounded-lg overflow-hidden border border-white/10 shrink-0">
        <img src={getImageUrl(sm.poster_path, 'w154')} alt="Selected" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => setSelectedMovies(selectedMovies.filter(m => m.id !== sm.id))}
          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black text-white"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    ))}`
);
content = content.replace(
  '<button\n                      type="button"\n                      onClick={() => setSelectedMovie(null)}\n                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black text-white"\n                    >\n                      <X className="w-3 h-3" />\n                    </button>',
  ''
);

// We need to fix the search results part.
content = content.replace(
  'onClick={() => {\n                            setSelectedMovie(m);\n                            setMovieSearchTerm(\'\');\n                            setMovieSearchResults([]);\n                          }}',
  `onClick={() => handleMovieSelect(m)}`
);

// We also need to fix how it's displayed in the feed.
content = content.replace(
  '<Link to={`/movie/${post.movieId}`} className="flex-shrink-0">',
  '{post.movies && post.movies.length > 0 ? (\n              <div className="flex gap-2 flex-shrink-0">\n                {post.movies.map((m: any) => (\n                  <Link key={m.id} to={`/movie/${m.id}`} className="w-20 h-28 rounded-md overflow-hidden bg-white/5 border border-white/10 block">\n                    {m.poster ? (\n                      <img src={getImageUrl(m.poster, \'w154\')} alt={m.title} className="w-full h-full object-cover" />\n                    ) : (\n                      <div className="w-full h-full flex flex-col items-center justify-center text-xs text-white/40 p-1 text-center">\n                        No Image\n                      </div>\n                    )}\n                  </Link>\n                ))}\n              </div>\n            ) : (\n              post.movieId ? <Link to={`/movie/${post.movieId}`} className="flex-shrink-0">'
);
content = content.replace(
  '</div>\n                  )}\n                </Link>',
  '</div>\n                  )}\n                </Link>\n              ) : null\n            )}'
);

content = content.replace(
  '<h4 className="text-white font-bold mb-1 hover:text-[#38bdf8] transition-colors">{post.movieTitle}</h4>',
  '{post.movies && post.movies.length > 0 ? null : <h4 className="text-white font-bold mb-1 hover:text-[#38bdf8] transition-colors">{post.movieTitle}</h4>}'
);


fs.writeFileSync('src/components/PostsFeed.tsx', content);
