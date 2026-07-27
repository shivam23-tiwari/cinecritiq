import fs from 'fs';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let regex = /useEffect\(([\s\S]*?)\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
     const body = match[1];
     // look for setSomething(
     const setMatches = body.match(/\bset[A-Z][a-zA-Z0-9]*\(/g);
     if (setMatches) {
        // console.log(`${f} has ${setMatches.join(', ')}`);
        // We only care if it's NOT inside onSnapshot, setTimeout, getDoc.then, etc.
        // Let's just print them
        const depsMatch = content.slice(match.index + match[0].length, match.index + match[0].length + 100).match(/^\s*\)?\s*(,\s*\[[^\]]*\])?/);
        console.log(`\n--- ${f} ---`);
        console.log(`Sets: ${setMatches.join(', ')}`);
        console.log(`Deps: ${depsMatch ? depsMatch[1] : 'UNKNOWN'}`);
     }
  }
});
