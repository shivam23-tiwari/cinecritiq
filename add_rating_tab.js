import fs from 'fs';

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
content = content.replace(/\{ id: 'watched', label: 'Films', icon: Eye, count: watched\.length \},/, `{ id: 'watched', label: 'Films', icon: Eye, count: watched.length },
    { id: 'ratings', label: 'Ratings', icon: Star, count: ratings.length },`);
fs.writeFileSync('src/pages/Profile.tsx', content);
