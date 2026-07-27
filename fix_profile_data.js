import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

// The place where it sets setProfileUser:
content = content.replace(/setProfileUser\(\{ id: userSnapMain\.id, \.\.\.userSnapMain\.data\(\) \}\);/, `setProfileUser({ id: userSnapMain.id, ...userSnapMain.data() });
            const data = userSnapMain.data();
            setProfileData({
              displayName: data.displayName || '',
              photoURL: data.photoURL || '',
              mobileNumber: data.mobileNumber || '',
              instagramUsername: data.instagramUsername || '',
              isPremium: data.isPremium || false,
              mcqWinnerStarUntil: data.mcqWinnerStarUntil || null
            });`);

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
