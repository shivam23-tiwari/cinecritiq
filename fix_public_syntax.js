import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

let endTarget = `  const handleFollow = async () => {`;

let startIdx = content.indexOf('  }, [user]);');
let endIdx = content.indexOf(endTarget);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx + '  }, [user]);'.length) + '\n\n' + content.substring(endIdx);
}

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
