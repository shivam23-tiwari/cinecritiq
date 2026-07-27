const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/r1, r2, /g, 'r1, r2, r3, r4, ');
code = code.replace(
/fetchFromTmdb\("\/movie\/now_playing", \{ page: "2" \}\),/,
`fetchFromTmdb("/movie/now_playing", { page: "2" }),
          fetchFromTmdb("/tv/on_the_air", { page: "1" }),
          fetchFromTmdb("/tv/on_the_air", { page: "2" }),`
);

code = code.replace(/const newRecent = combine\(r1, r2\);/, 'const newRecent = combine(r1, r2, r3, r4);');

const sectionToAdd = `
      {/* Recently Released Best Movies & Series */}
      <section className="py-8 px-6 md:px-10 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recently Released Best Movies & Series</h2>
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

code = code.replace(
/<\/section>\s*\{\/\* Only on Netflix \*\/\}/,
`</section>${sectionToAdd}      {/* Only on Netflix */}`
);

fs.writeFileSync('src/pages/Home.tsx', code);
