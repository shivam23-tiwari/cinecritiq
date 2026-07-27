const fs = require('fs');
let code = fs.readFileSync('/tmp/PostsFeed.tsx', 'utf8');

// replace the interface properties
code = code.replace(
  /movieId: number;\n  movieTitle: string;\n  moviePoster: string;/,
  'movies?: { id: number; title: string; poster: string; }[];\n  movieId?: number;\n  movieTitle?: string;\n  moviePoster?: string;'
);

// handle state for selected movies
code = code.replace(
  'const [selectedMovie, setSelectedMovie] = useState<any>(null);',
  `const [selectedMovie, setSelectedMovie] = useState<any>(null);\n  const [selectedMovies, setSelectedMovies] = useState<any[]>([]);\n\n  const handleMovieSelect = (m: any) => {\n    if (selectedMovies.some(sm => sm.id === m.id)) {\n      setSelectedMovies(selectedMovies.filter(sm => sm.id !== m.id));\n    } else if (selectedMovies.length < 4) {\n      setSelectedMovies([...selectedMovies, m]);\n    }\n  };`
);

// handle post creation
code = code.replace(
  'if (!user || !postContent.trim() || !selectedMovie) return;',
  'if (!user || !postContent.trim() || selectedMovies.length === 0) return;'
);
code = code.replace(
  'movieId: selectedMovie.id,\n        movieTitle: selectedMovie.title || selectedMovie.name,\n        moviePoster: selectedMovie.poster_path,',
  'movies: selectedMovies.map(m => ({ id: m.id, title: m.title || m.name, poster: m.poster_path })),'
);
code = code.replace(
  'setSelectedMovie(null);',
  'setSelectedMovies([]);\n      setSelectedMovie(null);'
);


fs.writeFileSync('/tmp/PostsFeed_updated.tsx', code);
