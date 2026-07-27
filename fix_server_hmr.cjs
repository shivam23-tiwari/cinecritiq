const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /hmr: \{ port: 24678 \+ Math\.floor\(Math\.random\(\) \* 1000\) \}/,
  `hmr: process.env.DISABLE_HMR !== 'true'`
);
fs.writeFileSync('server.ts', code);
