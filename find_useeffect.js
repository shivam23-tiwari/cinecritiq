import fs from 'fs';
import path from 'fs';

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
  let match;
  const regex = /useEffect\(([\s\S]*?)\}/g;
  while ((match = regex.exec(content)) !== null) {
    // Find what follows the }
    const rest = content.slice(match.index + match[0].length, match.index + match[0].length + 100);
    const depMatch = rest.match(/^\s*,\s*(\[[^\]]*\])/);
    if (depMatch) {
      // console.log(`${f}: useEffect with ${depMatch[1]}`);
    } else {
      console.log(`${f}: useEffect WITHOUT dependencies!`);
    }
  }
});
