const fs = require('fs');
const glob = require('glob');

// Insert ScrollRestorer in App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('ScrollRestorer')) {
  appCode = appCode.replace("import Navbar from './components/Navbar';", "import ScrollRestorer from './components/ScrollRestorer';\nimport Navbar from './components/Navbar';");
  appCode = appCode.replace("<Navbar />", "<ScrollRestorer />\n      <Navbar />");
  fs.writeFileSync('src/App.tsx', appCode);
}

// Remove cachedScroll logic from all pages
const files = [
  'src/pages/Home.tsx',
  'src/pages/Movies.tsx',
  'src/pages/Series.tsx',
  'src/pages/AnimePage.tsx',
  'src/pages/KidsZone.tsx',
  'src/pages/HorrorZone.tsx',
  'src/pages/Trending.tsx',
  'src/pages/Games.tsx',
  'src/pages/Shuffle.tsx',
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Remove "let cachedScroll: number = 0;"
    code = code.replace(/let cachedScroll:\s*number\s*=\s*0;\n?/, '');
    
    // Remove the two useEffects for scroll
    const scrollEffectRegex = /useEffect\(\(\) => {\s*const handleScroll = \(\) => {\s*cachedScroll = window\.scrollY;\s*};\s*window\.addEventListener\('scroll', handleScroll, { passive: true }\);\s*return \(\) => window\.removeEventListener\('scroll', handleScroll\);\s*}, \[\]\);\s*useEffect\(\(\) => {\s*if \(cachedScroll > 0\) {\s*setTimeout\(\(\) => window\.scrollTo\(0, cachedScroll\), 10\);\s*}\s*}, \[\]\);/s;
    
    code = code.replace(scrollEffectRegex, '');
    
    fs.writeFileSync(file, code);
  }
}

console.log("Scroll restoration updated successfully!");
