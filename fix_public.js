import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

// Replace `if (!loading && !user)` which is now `if (!userId)` ... wait, let's fix `loading`
content = content.replace(/!loading/g, '!authLoading');
content = content.replace(/loading/g, 'authLoading');

content = content.replace(/user\.displayName/g, '(profileUser?.displayName || "")');
content = content.replace(/user\.photoURL/g, '(profileUser?.photoURL || "")');
content = content.replace(/logout/g, '(() => {})');

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
