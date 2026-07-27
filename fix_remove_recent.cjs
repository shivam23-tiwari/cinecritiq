const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/\{\/\* Recently released best movies and series \*\/\}[\s\S]*?\{\/\* Popular TV Series \*\/\}/, '{/* Popular TV Series */}');

fs.writeFileSync('src/pages/Home.tsx', code);
