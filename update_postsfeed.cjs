const fs = require('fs');
let content = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');

// Replace single movie fields with array of movies
content = content.replace(
  '  movieId: number;\n  movieTitle: string;\n  moviePoster: string;',
  '  movies: { id: number; title: string; poster: string; }[];'
);

content = content.replace(
  'const [selectedMovie, setSelectedMovie] = useState<any>(null);',
  'const [selectedMovies, setSelectedMovies] = useState<any[]>([]);'
);

content = content.replace(
  'const handleSubmit = async',
  `const handleMovieSelect = (m) => {
    if (selectedMovies.some(sm => sm.id === m.id)) {
      setSelectedMovies(selectedMovies.filter(sm => sm.id !== m.id));
    } else if (selectedMovies.length < 4) {
      setSelectedMovies([...selectedMovies, m]);
    }
  };

  const handleSubmit = async`
);

content = content.replace(
  'if (!user || !postContent.trim() || !selectedMovie) return;',
  'if (!user || !postContent.trim() || selectedMovies.length === 0) return;'
);

content = content.replace(
  "movieId: selectedMovie.id,\n        movieTitle: selectedMovie.title || selectedMovie.name,\n        moviePoster: selectedMovie.poster_path,",
  "movies: selectedMovies.map(m => ({ id: m.id, title: m.title || m.name, poster: m.poster_path })),"
);

content = content.replace(
  "setSelectedMovie(null);",
  "setSelectedMovies([]);"
);

// We need to rewrite the search results rendering to support multi-select.
// I will just rewrite the file.
