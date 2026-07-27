import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');
content = content.replace(/setProfileData\(prev => \(\{/, 'setProfileData(prev => {\n        if (prev.displayName === ((profileUser?.displayName || "") || \'\') && prev.photoURL === ((profileUser?.photoURL || "") || \'\')) return prev;\n        return {');
fs.writeFileSync('src/pages/PublicProfile.tsx', content);

let profile = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
profile = profile.replace(/setProfileData\(prev => \(\{/, 'setProfileData(prev => {\n        if (prev.displayName === (user.displayName || \'\') && prev.photoURL === (user.photoURL || \'\')) return prev;\n        return {');
fs.writeFileSync('src/pages/Profile.tsx', profile);

