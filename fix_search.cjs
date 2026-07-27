const fs = require('fs');
let code = fs.readFileSync('src/pages/Search.tsx', 'utf8');

code = code.replace(/const hentaiResults = [\s\S]*?setResults\(\[\.\.\.\(movieRes\.results \|\| \[\]\), \.\.\.hentaiResults\]\);/, 'setResults(movieRes.results || []);');
fs.writeFileSync('src/pages/Search.tsx', code);
