const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const newSection = `
      {/* Recently Released Movies */}
      {recent.length > 0 && (
        <section className="py-8 px-6 md:px-10 relative z-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recently Released Movies</h2>
          </div>
          <div className="overflow-x-auto overscroll-x-contain scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
            <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
              {recent.map((movie, idx) => (
                <div key={\`recent-\${movie.id}-\${idx}\`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
`;

// Insert it right after the closing tag of Upcoming Best Movies section
code = code.replace(/(<h2 className="text-lg font-semibold text-white">Upcoming Best Movies<\/h2>[\s\S]*?<\/section>)/, `$1\n${newSection}`);

fs.writeFileSync('src/pages/Home.tsx', code);
