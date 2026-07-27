import fs from 'fs';

async function fetchMovies() {
  const apiKey = '15d2ea6d0dc1d476efbcaa3bf5146885'; // tutorial key used temporarily to build static data
  let allMovies: any[] = [];
  
  try {
    // Trending
    for(let page=1; page<=3; page++){
      const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&page=${page}`);
      const data = await res.json();
      if(data.results) allMovies.push(...data.results);
    }
    // Kids
    const kids = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16,10751&sort_by=popularity.desc`);
    const kidsData = await kids.json();
    if(kidsData.results) allMovies.push(...kidsData.results);
    
    // Top Rated
    const top = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=1`);
    const topData = await top.json();
    if(topData.results) allMovies.push(...topData.results);

    // Deduplicate
    const map = new Map();
    for(const m of allMovies) {
      if(!map.has(m.id)) map.set(m.id, m);
    }
    
    const finalMovies = Array.from(map.values());
    
    const content = `export const fallbackMovies = ${JSON.stringify(finalMovies, null, 2)};

export const getFallbackData = (endpoint: string, params: Record<string, string> = {}) => {
  if (endpoint.includes('/movie/') && !endpoint.includes('/trending') && !endpoint.includes('/search') && !endpoint.includes('/now_playing') && !endpoint.includes('/top_rated') && !endpoint.includes('/popular') && !endpoint.includes('/upcoming')) {
    const id = parseInt(endpoint.split('/movie/')[1]?.split('/')[0]);
    if (endpoint.includes('/credits')) return { id, cast: [] };
    if (endpoint.includes('/similar')) return { results: fallbackMovies.slice(0, 10) };
    if (endpoint.includes('/videos')) return { results: [] };
    const movie = fallbackMovies.find(m => m.id === id) || fallbackMovies[0];
    return { ...movie, runtime: 120, status: 'Released', genres: movie.genre_ids?.map((i: any) => ({id: i, name: 'Genre'})) || [] };
  }
  if (endpoint.includes('/search/movie')) {
    const q = params.query?.toLowerCase() || '';
    return { results: fallbackMovies.filter(m => m.title?.toLowerCase().includes(q)) };
  }
  if (endpoint.includes('/discover/movie')) { // kids
    return { results: fallbackMovies.filter(m => m.genre_ids?.includes(16) || m.genre_ids?.includes(10751)) };
  }
  if (endpoint.includes('/movie/top_rated')) {
    return { results: [...fallbackMovies].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)) };
  }
  if (endpoint.includes('/movie/now_playing')) {
    return { results: fallbackMovies.slice().reverse() };
  }
  return { results: fallbackMovies };
};
`;
    
    fs.writeFileSync('src/lib/fallbackData.ts', content);
    console.log("Successfully generated fallback data with", finalMovies.length, "movies.");
  } catch(err) {
    console.error("Failed to generate fallback data:", err);
  }
}

fetchMovies();
