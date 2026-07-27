import { fetchFromTmdb } from './src/lib/tmdb';
fetchFromTmdb("/search/movie", { query: "pritam and pedro" }).then(res => console.log("SEARCH", JSON.stringify(res))).catch(err => console.error(err));
