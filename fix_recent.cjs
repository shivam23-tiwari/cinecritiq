const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regexRecent = /const newRecent = combine\(r1, r2, r3, r4\)\.filter\([\s\S]*?\}\);/g;

const replacementRecent = `const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
        const newRecent = combine(r1, r2, r3, r4).filter(item => {
          const rDate = item.release_date || item.first_air_date;
          return rDate && rDate <= today && rDate >= thirtyDaysAgoStr && (item.vote_average >= 6.5 || item.popularity >= 100);
        }).sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01').getTime();
          return dateB - dateA;
        });`;

code = code.replace(regexRecent, replacementRecent);

const recentSection = `
      {/* Recently released best movies and series */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recently released best movies and series</h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {recent.map((movie, idx) => (
              <div key={\`recent-\${movie.id}-\${idx}\`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>
`;

code = code.replace(/\{\/\* Only on Netflix \*\/\}/, recentSection + '      {/* Only on Netflix */}');

fs.writeFileSync('src/pages/Home.tsx', code);
