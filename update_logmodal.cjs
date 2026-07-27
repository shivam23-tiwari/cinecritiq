const fs = require('fs');
let content = fs.readFileSync('src/components/LogModal.tsx', 'utf8');

content = content.replace(
  "userId: user.uid,",
  "userId: user.uid,\n        userName: user.displayName || 'Anonymous',\n        userPhoto: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`,\n        type: 'log',"
);

fs.writeFileSync('src/components/LogModal.tsx', content);
