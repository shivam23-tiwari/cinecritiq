const fs = require('fs');
console.log(fs.readFileSync('src/components/PostsFeed.tsx', 'utf8').includes('movies: { id: number; title: string; poster: string; }[];'));
