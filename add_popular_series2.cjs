const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /const newTopSearched = combine\(ts1, ts2, ts3, ts4, ts5\);/;
const replacement = `const newTopSearched = combine(ts1, ts2, ts3, ts4, ts5);
        const specificSeries = [got, squid, stranger, suits].filter(m => m && m.id && m.poster_path).map(m => ({...m, media_type: 'tv'}));
        const fetchedPopular = combine(ps1, ps2, ps3, ps4, ps5);
        const newPopularSeries = [...specificSeries, ...fetchedPopular.filter(item => !specificSeries.find(s => s.id === item.id))];`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Home.tsx', code);
