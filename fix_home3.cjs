const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Filter recent
code = code.replace(/const newRecent = combine\(r1, r2, r3, r4\)\.sort[^\;]+;/,
`const newRecent = combine(r1, r2, r3, r4).filter(item => {
          const rDate = item.release_date || item.first_air_date;
          return rDate && rDate <= today && (item.vote_average >= 6.5 || item.popularity >= 100);
        }).sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01').getTime();
          return dateB - dateA;
        });`
);

// Replace headings
code = code.replace(/Recently Released Best Movies & Series/g, 'Recently released best movies and series');

// Remove upcoming section
code = code.replace(/\{\/\* Upcoming Best Movies \*\/\}\s*<section[\s\S]*?<\/section>\s*\{\/\* Recently released/, '{/* Recently released');

fs.writeFileSync('src/pages/Home.tsx', code);
