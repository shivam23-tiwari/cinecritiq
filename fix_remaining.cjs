const fs = require('fs');
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(/import hentaiAnime from '\.\.\/lib\/hentai\.json';\n/, '');
fs.writeFileSync('src/pages/Home.tsx', homeCode);

let authCode = fs.readFileSync('src/lib/AuthContext.tsx', 'utf8');
authCode = authCode.replace(/hentaiAccess\?: boolean;\n/g, '');
fs.writeFileSync('src/lib/AuthContext.tsx', authCode);
