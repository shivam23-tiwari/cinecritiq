import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

// Find the line numbers using regex and delete everything from the rogue `if (entryExists)` to `setIsSavingDiary(false);`
let regex = /if \(entryExists\) {[\s\S]*?setIsSavingDiary\(false\);\n    }/;
content = content.replace(regex, '');

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
