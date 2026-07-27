const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace all occurrences of overflow-x-auto that don't already have overscroll-x-contain
code = code.replace(/className="overflow-x-auto/g, 'className="overflow-x-auto overscroll-x-contain');

fs.writeFileSync('src/pages/Home.tsx', code);
