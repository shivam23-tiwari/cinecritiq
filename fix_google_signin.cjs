const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');
code = code.replace("provider.setCustomParameters({ prompt: 'select_account' });", "");
fs.writeFileSync('src/pages/Login.tsx', code);

code = fs.readFileSync('src/lib/AuthContext.tsx', 'utf8');
code = code.replace("provider.setCustomParameters({ prompt: 'select_account' });", "");
fs.writeFileSync('src/lib/AuthContext.tsx', code);

console.log("Fixed google signin prompts");
