import fs from 'fs';

let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
profile = profile.replace(/displayName: user.displayName \|\| '',\n\s*photoURL: user.photoURL \|\| ''\n\s*\}\)\);/, "displayName: user.displayName || '',\n        photoURL: user.photoURL || ''\n      };});");
fs.writeFileSync('src/pages/Profile.tsx', profile);

let pubProfile = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');
pubProfile = pubProfile.replace(/displayName: \(profileUser\?.displayName \|\| ""\) \|\| '',\n\s*photoURL: \(profileUser\?.photoURL \|\| ""\) \|\| ''\n\s*\}\)\);/, "displayName: (profileUser?.displayName || \"\") || '',\n        photoURL: (profileUser?.photoURL || \"\") || ''\n      };});");
fs.writeFileSync('src/pages/PublicProfile.tsx', pubProfile);
