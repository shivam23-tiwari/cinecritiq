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
  // Very rough check: look for setSomething(...) not preceded by =>, return, or function
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.match(/\bset[A-Z][a-zA-Z0-9]*\(/)) {
       // if it doesn't contain => or function or onClick or onChange or onSubmit
       if (!line.includes('=>') && !line.includes('function') && !line.includes('onClick') && !line.includes('onChange') && !line.includes('onSubmit') && !line.includes('catch') && !line.includes('then')) {
          console.log(f + ':' + (i+1) + ' ' + line.trim());
       }
    }
  });
});
