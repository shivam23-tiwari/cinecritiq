const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/const newRecent = combine\(r1, r2, r3, r4\)\.filter\([\s\S]*?\}\);/g, '');
code = code.replace(/const newTopRated = combine\(tr1, tr2, tr3, tr4, tr5\);/, 
`const newRecent = combine(r1, r2, r3, r4).filter(item => {
          const rDate = item.release_date || item.first_air_date;
          return rDate && rDate <= today && (item.vote_average >= 6.5 || item.popularity >= 100);
        }).sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01').getTime();
          return dateB - dateA;
        });
        const newTopRated = combine(tr1, tr2, tr3, tr4, tr5);`
);

fs.writeFileSync('src/pages/Home.tsx', code);
