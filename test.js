const fs = require('fs');
console.log(fs.readFileSync('src/pages/MovieDetails.tsx', 'utf8').includes('poster.aspect_ratio'));
