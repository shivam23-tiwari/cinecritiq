const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

// The code added starts with window.addEventListener('error', (event) => {
// and goes down to document.body.appendChild(el);  }});
code = code.replace(/window\.addEventListener\('error', \(event\) => \{\s*const msg = String\(event\.error\?\.message \|\| event\.message \|\| ""\);\s*if \(\!msg\.includes\('Quota'\)\) \{[\s\S]*?\}\}\);\s*window\.addEventListener\('unhandledrejection', \(event\) => \{\s*const msg = String\(event\.reason\?\.message \|\| event\.reason \|\| ""\);\s*if \(\!msg\.includes\('Quota'\)\) \{[\s\S]*?\}\}\);/, '');

fs.writeFileSync('src/main.tsx', code);
