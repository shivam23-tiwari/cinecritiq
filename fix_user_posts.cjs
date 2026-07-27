const fs = require('fs');
let code = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');

code = code.replace(/const { userData } = useAuth\(\);/, 'const { user, userData } = useAuth();');

fs.writeFileSync('src/components/PostsFeed.tsx', code);
