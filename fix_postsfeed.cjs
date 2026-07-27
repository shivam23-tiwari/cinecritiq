const fs = require('fs');
let code = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');

// If we have currentUser, let's use user.displayName for their own posts dynamically, but we only have `user` from auth. `userData` might have the up-to-date name.
// Actually, `post.userId === user?.uid ? (user?.displayName || post.userName) : post.userName` works. Wait, `useAuth` provides `userData.displayName`. Let's use `userData?.displayName`.
code = code.replace(/post\.userName/g, "(post.userId === user?.uid && userData?.displayName ? userData.displayName : post.userName)");
code = code.replace(/c\.userName/g, "(c.userId === user?.uid && userData?.displayName ? userData.displayName : c.userName)");
fs.writeFileSync('src/components/PostsFeed.tsx', code);
