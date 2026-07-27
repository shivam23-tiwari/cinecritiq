import fs from 'fs';

let publicProfile = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');
publicProfile = publicProfile.replace(/useEffect\(\(\) => \{/g, `useEffect(() => { console.log('useEffect PublicProfile', new Error().stack.split('\\n')[1]);`);
fs.writeFileSync('src/pages/PublicProfile.tsx', publicProfile);

let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
profile = profile.replace(/useEffect\(\(\) => \{/g, `useEffect(() => { console.log('useEffect Profile', new Error().stack.split('\\n')[1]);`);
fs.writeFileSync('src/pages/Profile.tsx', profile);

let postsFeed = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');
postsFeed = postsFeed.replace(/useEffect\(\(\) => \{/g, `useEffect(() => { console.log('useEffect PostsFeed', new Error().stack.split('\\n')[1]);`);
fs.writeFileSync('src/components/PostsFeed.tsx', postsFeed);

