const fs = require('fs');

function fixFile(file, regex1, replacement1, regex2, replacement2) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content.replace(regex1, replacement1);
        if (regex2) {
            newContent = newContent.replace(regex2, replacement2);
        }
        if (newContent !== content) {
            fs.writeFileSync(file, newContent);
            console.log(`Fixed ${file}`);
        }
    }
}

fixFile('src/components/LogModal.tsx', 
  /const \{ user \} = useAuth\(\);/, 
  "const { user, userData } = useAuth();",
  /userPhoto: user\.photoURL \|\|/g,
  "userPhoto: userData?.photoURL || user.photoURL ||"
);

fixFile('src/components/ReviewsSection.tsx', 
  /const \{ user \} = useAuth\(\);/, 
  "const { user, userData } = useAuth();",
  /userPhoto: user\.photoURL \|\|/g,
  "userPhoto: userData?.photoURL || user.photoURL ||"
);

fixFile('src/components/PostsFeed.tsx', 
  /userPhoto: user\.photoURL \|\|/g,
  "userPhoto: userData?.photoURL || user.photoURL ||",
  /userPhoto: currentUser\.photoURL \|\|/g,
  "userPhoto: userData?.photoURL || currentUser.photoURL ||"
);

