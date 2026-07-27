const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/const newUpcoming = combine\(u1, u2, u3, u4, u5\)\.filter\(\(movie: any\) => movie\.release_date\);/, 'const newUpcoming = combine(u1, u2, u3, u4, u5).filter((movie: any) => movie.release_date && movie.release_date > today);');
fs.writeFileSync('src/pages/Home.tsx', code);
