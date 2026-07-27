import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

// remove duplicate followersCount
let dupFollowersRegex = /const \[followersCount, setFollowersCount\] = useState\(0\);\n  const \[followingCount, setFollowingCount\] = useState\(0\);/g;
let matches = [...content.matchAll(dupFollowersRegex)];
if (matches.length > 1) {
  content = content.replace(matches[1][0], '');
}

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
