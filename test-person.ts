import { fetchFromTmdb } from './src/lib/tmdb';
fetchFromTmdb("/person/202").then(res => console.log(res)).catch(err => console.error(err));
fetchFromTmdb("/person/202/movie_credits").then(res => console.log(res)).catch(err => console.error(err));
