const fs = require('fs');
const content = fs.readFileSync('src/pages/AnimePage.tsx', 'utf8');

const newContent = content.replace(
  /const staticAnimeIds = \[[\s\S]*?\];/g,
  `const staticAnimeIds = [
          46260, 37854, 65733, 30623, 95479, 60572, 80885, 12971,
          31910, 37854, 30984, 1429, 13916,
          65930, 85937, 62715, 31911, 46261, 73223, 45782, 61374, 45790,
          63926, 67075, 30991, 890, 42509, 31724, 60863, 45783, 88803,
          120089, 114410, 131041, 86031
        ];`
).replace(/const staticAnimeIds = new Set\(\[[\s\S]*?\]\);/g, `const staticAnimeIds = new Set([
            46260, 37854, 65733, 30623, 95479, 60572, 80885, 12971,
            31910, 30984, 1429, 13916,
            65930, 85937, 62715, 31911, 46261, 73223, 45782, 61374, 45790,
            63926, 67075, 30991, 890, 42509, 31724, 60863, 45783, 88803,
            120089, 114410, 131041, 86031
          ]);`);

fs.writeFileSync('src/pages/AnimePage.tsx', newContent);
