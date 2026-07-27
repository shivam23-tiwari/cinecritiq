const fs = require('fs');
let horror = fs.readFileSync('src/pages/HorrorZone.tsx', 'utf8');
horror = horror.replace(
  /cachedMovies = \(prev\) => \(bg \? prev : initialMovies\);/,
  `cachedMovies = (bg ? cachedMovies : initialMovies);`
);
fs.writeFileSync('src/pages/HorrorZone.tsx', horror);

let kids = fs.readFileSync('src/pages/KidsZone.tsx', 'utf8');
kids = kids.replace(
  /cachedMovies = \(prev\) => \(bg \? prev : initialMovies\);/,
  `cachedMovies = (bg ? cachedMovies : initialMovies);`
);
fs.writeFileSync('src/pages/KidsZone.tsx', kids);
console.log("Zones fixed");
