const fs = require('fs');
const content = fs.readFileSync('src/pages/AnimePage.tsx', 'utf8');

const newContent = content.replace(
  /const fetchAnime = async \(pageNum: number\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};/,
  `const fetchAnime = async (pageNum: number) => {
    setLoading(true);
    try {
      if (pageNum === 1) {
        const staticAnimeIds = [
          46260, 31910, 37854, 30984, 1429, 95479, 60572, 13916, 12971,
          65930, 85937, 62715, 31911, 46261, 73223, 45782, 61374, 45790,
          63926, 67075, 30991, 890, 42509, 31724, 60863, 45783, 88803,
          120089, 114410, 131041, 86031
        ];
        
        const topAnimes = await Promise.all(
          staticAnimeIds.map(id => fetchFromTmdb('/tv/' + id))
        );
        
        const validTopAnimes = topAnimes.filter(a => a && a.id);
        
        setAnimeList(validTopAnimes);
        setHasMore(true);
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
          const hentaiIds = new Set(hentaiAnime.map((h: any) => h.id));
          const staticAnimeIds = new Set([
            46260, 31910, 37854, 30984, 1429, 95479, 60572, 13916, 12971,
            65930, 85937, 62715, 31911, 46261, 73223, 45782, 61374, 45790,
            63926, 67075, 30991, 890, 42509, 31724, 60863, 45783, 88803,
            120089, 114410, 131041, 86031
          ]);
          
          const filteredResults = res.results.filter((a: any) => !hentaiIds.has(a.id) && !staticAnimeIds.has(a.id));
          
          setAnimeList(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newUnique = filteredResults.filter((a: any) => !existingIds.has(a.id));
            return [...prev, ...newUnique];
          });
          
          setHasMore(discoverPage < res.total_pages && discoverPage < 100);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };`
);

fs.writeFileSync('src/pages/AnimePage.tsx', newContent);
