const fs = require('fs');

let searchCode = fs.readFileSync('src/pages/Search.tsx', 'utf8');
searchCode = searchCode.replace(/import hentaiAnime from '\.\.\/lib\/hentai\.json';\n/, '');
searchCode = searchCode.replace(/const hentaiResults = lowercaseQuery === 'hentai' \? hentaiAnime\.map\(\(h: any\) => \(\{ \.\.\.h, isHentai: true \}\)\) : hentaiAnime\s*\.filter\(\(h: any\) => \(\(h\.title \|\| h\.name\) \?\? ''\)\.toLowerCase\(\)\.includes\(lowercaseQuery\)\)\s*\.map\(\(h: any\) => \(\{ \.\.\.h, isHentai: true \}\)\);\s*setResults\(\[\.\.\.\(movieRes\.results \|\| \[\]\), \.\.\.hentaiResults\]\);/, 'setResults(movieRes.results || []);');
fs.writeFileSync('src/pages/Search.tsx', searchCode);

let detailsCode = fs.readFileSync('src/pages/MovieDetails.tsx', 'utf8');
detailsCode = detailsCode.replace(/const isHentai = hentaiAnime\.some\(h => String\(h\.id\) === String\(id\)\) \|\| searchParams\.get\('isHentai'\) === 'true';\s*if \(isHentai\) {.*?}\s*}\s*\n/gs, '');
fs.writeFileSync('src/pages/MovieDetails.tsx', detailsCode);

let animeCode = `import React, { useState, useEffect } from 'react';
import { fetchFromTmdb } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';

let cachedAnimeList: any[] = [];
let cachedPage: number = 1;
let cachedHasMore: boolean = true;

export default function AnimePage() {
  const [animeList, setAnimeList] = useState<any[]>(cachedAnimeList);
  const [page, setPage] = useState(cachedPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(cachedHasMore);

  const fetchAnime = async (pageNum: number) => {
    setLoading(true);
    try {
      if (pageNum === 1) {
        const staticAnimeIds = [
          46260, 37854, 65733, 30623, 95479, 60572, 80885, 12971,
          31910, 30984, 1429, 13916,
          65930, 85937, 62715, 31911, 46261, 73223, 45782, 61374, 45790,
          63926, 67075, 30991, 890, 42509, 31724, 60863, 45783, 88803,
          120089, 114410, 131041, 86031
        ];
        
        const topAnimes = await Promise.all(
          staticAnimeIds.map(id => fetchFromTmdb('/tv/' + id))
        );
        
        const validTopAnimes = topAnimes.filter(a => a && a.id);
        
        setAnimeList(validTopAnimes);
        cachedAnimeList = validTopAnimes;
        setHasMore(true);
        cachedHasMore = true;
      } else {
        const discoverPage = pageNum - 1;
        const res = await fetchFromTmdb('/discover/tv', {
          with_genres: '16',
          with_original_language: 'ja',
          sort_by: 'popularity.desc',
          include_adult: 'false',
          page: discoverPage.toString()
        });
        
        if (res.results) {
          const staticAnimeIds = new Set([
            46260, 37854, 65733, 30623, 95479, 60572, 80885, 12971,
            31910, 30984, 1429, 13916,
            65930, 85937, 62715, 31911, 46261, 73223, 45782, 61374, 45790,
            63926, 67075, 30991, 890, 42509, 31724, 60863, 45783, 88803,
            120089, 114410, 131041, 86031
          ]);
          
          const filteredResults = res.results.filter((a: any) => !staticAnimeIds.has(a.id));
          
          setAnimeList(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newUnique = filteredResults.filter((a: any) => !existingIds.has(a.id));
            const updated = [...prev, ...newUnique];
            cachedAnimeList = updated;
            return updated;
          });
          
          const more = discoverPage < res.total_pages && discoverPage < 100;
          setHasMore(more);
          cachedHasMore = more;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (animeList.length === 0) {
      fetchAnime(1);
    }
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      cachedPage = nextPage;
      fetchAnime(nextPage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-12 min-h-screen">
      <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-lg mb-8">
        <span className="text-[#38bdf8]">ANIME</span> ZONE
      </h1>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
        {animeList.map((movie, idx) => (
          <MovieCard key={\`anime-\${movie.id}-\${idx}\`} movie={{...movie, media_type: 'tv'}} />
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38bdf8]"></div>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center mt-10">
          <button 
            onClick={loadMore}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all"
          >
            Load More Anime
          </button>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/pages/AnimePage.tsx', animeCode);

// MovieCard.tsx
let movieCardCode = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');
movieCardCode = movieCardCode.replace(/\$\{movie\.isHentai \? '&isHentai=true' : ''\}/, '');
fs.writeFileSync('src/components/MovieCard.tsx', movieCardCode);

