const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/ps1, ps2, ps3, ps4, ps5/, 'ps1, ps2, ps3, ps4, ps5,\n          got, squid, stranger, suits');

code = code.replace(/fetchFromTmdb\("\/tv\/popular", \{ page: "5" \}\),/, 'fetchFromTmdb("/tv/popular", { page: "5" }),\n          fetchFromTmdb("/tv/1399"),\n          fetchFromTmdb("/tv/93405"),\n          fetchFromTmdb("/tv/66732"),\n          fetchFromTmdb("/tv/37680"),');

code = code.replace(/const newPopularSeries = combine\(ps1, ps2, ps3, ps4, ps5\);/, 'const specificSeries = [got, squid, stranger, suits].filter(m => m && !m.success === false);\n        const fetchedPopular = combine(ps1, ps2, ps3, ps4, ps5);\n        const newPopularSeries = [...specificSeries, ...fetchedPopular.filter(item => !specificSeries.find(s => s.id === item.id))];');

fs.writeFileSync('src/pages/Home.tsx', code);
