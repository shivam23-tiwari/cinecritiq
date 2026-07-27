import fs from 'fs';

let content = fs.readFileSync('src/pages/MovieDetails.tsx', 'utf8');

content = content.replace(/      fetchUserData\(\);\n    }/g, "      fetchUserData();\n    } else {\n      setInWatchlist(false);\n      setIsWatched(false);\n      setIsFavorite(false);\n      setUserRating(null);\n    }");

fs.writeFileSync('src/pages/MovieDetails.tsx', content);
