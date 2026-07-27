const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
/const newRecent = combine\(r1, r2, r3, r4\);/,
`const newRecent = combine(r1, r2, r3, r4).sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01').getTime();
          return dateB - dateA;
        });`
);

fs.writeFileSync('src/pages/Home.tsx', code);
