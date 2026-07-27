const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/const specificSeries = \[got, squid, stranger, suits\]\.filter\(m => m && !m.success === false\);/, 
`const specificSeries = [got, squid, stranger, suits].filter(m => m && m.id && m.poster_path).map(m => ({...m, media_type: 'tv'}));`);

fs.writeFileSync('src/pages/Home.tsx', code);
