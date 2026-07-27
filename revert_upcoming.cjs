const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const replacement = `      {/* Upcoming Best Movies */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Best Movies</h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide py-8 -mx-6 px-6 md:-mx-10 md:px-10">
          <div className="flex gap-3 md:gap-5" style={{ width: "max-content" }}>
            {upcoming.map((movie, idx) => (
              <div key={\`upcoming-\${movie.id}-\${idx}\`} className="w-[95px] sm:w-[160px] md:w-[200px] lg:w-[220px]">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      </section>`;

code = code.replace(/\{\/\* Recently released[\s\S]*?<\/section>/, replacement);

fs.writeFileSync('src/pages/Home.tsx', code);
