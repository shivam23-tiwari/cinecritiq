import { fetchFromTmdb } from './src/lib/tmdb';
fetchFromTmdb("/movie/1727469/watch/providers").then(res => console.log(JSON.stringify(res))).catch(err => console.error(err));
