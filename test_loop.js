import fs from 'fs';
const text = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');
const match = text.match(/useEffect/g);
console.log(match.length);
