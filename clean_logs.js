import fs from 'fs';

['src/pages/Profile.tsx', 'src/pages/PublicProfile.tsx', 'src/components/PostsFeed.tsx'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/console\.log\('useEffect [^']+new Error\(\)\.stack\.split\('\\n'\)\[1\]\);\n?\s*/g, '');
  fs.writeFileSync(f, content);
});
