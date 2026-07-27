import { fetchFromTmdb } from './src/lib/tmdb';
fetchFromTmdb("/movie/1727469").then(res => console.log("MOVIE", JSON.stringify(res))).catch(err => console.error(err));
