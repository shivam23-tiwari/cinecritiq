import fs from 'fs';

let content = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');

content = content.replace(/    if \(\!currentUser\) return;/g, "    if (!currentUser) {\n      setHasLiked(false);\n      return;\n    }");

fs.writeFileSync('src/components/PostsFeed.tsx', content);
