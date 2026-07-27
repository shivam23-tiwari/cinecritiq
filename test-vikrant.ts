import { fetchFromTmdb } from './src/lib/tmdb';
fetchFromTmdb("/person/203/movie_credits").then(res => console.log(JSON.stringify(res))).catch(err => console.error(err));
