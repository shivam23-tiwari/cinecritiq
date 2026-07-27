const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

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

code = code.replace(/<\/section>\s*<\/div>\s*\);/g, '</section>' + bestSeriesSection + '</div>);');

fs.writeFileSync('src/pages/Home.tsx', code);
