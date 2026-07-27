const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Add global var
code = code.replace(/let globalGhostMovies: any\[\] = \[\];/, 'let globalGhostMovies: any[] = [];\nlet globalBestSeries: any[] = [];');

// Add state var
code = code.replace(/const \[ghostMovies, setGhostMovies\] = useState<any\[\]>\(globalGhostMovies\);/, 'const [ghostMovies, setGhostMovies] = useState<any[]>(globalGhostMovies);\n  const [bestSeries, setBestSeries] = useState<any[]>(globalBestSeries);');

// Add to sync initialization
code = code.replace(/setGhostMovies\(globalGhostMovies\);/, 'setGhostMovies(globalGhostMovies);\n        setBestSeries(globalBestSeries);');

// Add fetch
code = code.replace(/top1, top2, top3, top4, top5, top6, top7, top8, top9, top10, top11, top12, top13, top14, top15, top16, top17, top18, top19, top20, top21, top22, top23, top24, top25, top26, top27, top28, top29, top30\n          \] = await Promise.all\(\[/, 
`top1, top2, top3, top4, top5, top6, top7, top8, top9, top10, top11, top12, top13, top14, top15, top16, top17, top18, top19, top20, top21, top22, top23, top24, top25, top26, top27, top28, top29, top30,
          bs1, bs2, bs3, bs4, bs5, bs6, bs7
          ] = await Promise.all([`
);

code = code.replace(/fetchFromTmdb\("\/tv\/86031"\)\n        \]\);/,
`fetchFromTmdb("/tv/86031"),
          fetchFromTmdb("/tv/119051"), // House of the dragon
          fetchFromTmdb("/tv/1399"), // Game of thrones
          fetchFromTmdb("/tv/124364"), // From
          fetchFromTmdb("/tv/37680"), // Suits
          fetchFromTmdb("/tv/110316"), // Alice
          fetchFromTmdb("/tv/93405"), // Squid Game
          fetchFromTmdb("/tv/66732") // Stranger things
        ]);`
);

code = code.replace(/const newGhostMovies = combine\(ghost1\);/,
`const newGhostMovies = combine(ghost1);
        const newBestSeries = combine({results:[bs1, bs2, bs3, bs4, bs5, bs6, bs7]});`
);

code = code.replace(/globalGhostMovies = newGhostMovies;/, 'globalGhostMovies = newGhostMovies;\n        globalBestSeries = newBestSeries;');
code = code.replace(/setGhostMovies\(newGhostMovies\);/, 'setGhostMovies(newGhostMovies);\n        setBestSeries(newBestSeries);');

// Add section at the bottom, before closing main tag or similar.
const bestSeriesSection = `
      {/* Best Series of All Time */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Best Series of All Time</h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {bestSeries.map((movie, idx) => (
              <div key={\`bs-\${movie.id}-\${idx}\`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>
`;

code = code.replace(/<\/div>\s*<\/div>\s*<\/section>\s*<\/main>/, '</div></div></section>' + bestSeriesSection + '</main>');

// Inject scroll restore code
const scrollRestoreHook = `
  useEffect(() => {
    // Restore window scroll
    const handleScroll = () => {
      sessionStorage.setItem('home_scroll_y', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Attempt restore
    setTimeout(() => {
      const scrollY = sessionStorage.getItem('home_scroll_y');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
      }
      
      const carousels = document.querySelectorAll('.overflow-x-auto');
      carousels.forEach((c, i) => {
        const scrollX = sessionStorage.getItem(\`home_carousel_\${i}\`);
        if (scrollX) {
          c.scrollLeft = parseInt(scrollX);
        }
        c.addEventListener('scroll', () => {
          sessionStorage.setItem(\`home_carousel_\${i}\`, c.scrollLeft.toString());
        }, { passive: true });
      });
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [trending]);
`;

code = code.replace(/useEffect\(\(\) => \{\n    let mounted = true;/, scrollRestoreHook + '\n  useEffect(() => {\n    let mounted = true;');

fs.writeFileSync('src/pages/Home.tsx', code);
