import { fetchFromTmdb } from './src/lib/tmdb';
fetchFromTmdb("/movie/1727469/credits").then(res => console.log("CREDITS", JSON.stringify(res))).catch(err => console.error(err));
