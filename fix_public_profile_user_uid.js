import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

// Replace `user.uid` with `userId` where appropriate.
// In fetchUserPosts:
content = content.replace(/where\('userId', '==', user\.uid\)/g, "where('userId', '==', userId)");

// In fetchActions:
content = content.replace(/`users\/\$\{user\.uid\}\/movieActions`/g, "`users/${userId}/movieActions`");

// In fetchExtendedProfile:
// wait, where is that?
fs.writeFileSync('src/pages/PublicProfile.tsx', content);
