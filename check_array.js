const fs = require('fs');
const code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /const \[\s*([\s\S]*?)\s*\] = await Promise\.all\(\[\s*([\s\S]*?)\s*\]\);/m;
const match = code.match(regex);
if (match) {
  const vars = match[1].split(',').map(s => s.trim()).filter(Boolean);
  
  // Custom parsing for elements in Promise.all
  // This is a naive split by fetchFromTmdb which should work for counting
  const callsText = match[2];
  const callsCount = (callsText.match(/fetchFromTmdb/g) || []).length;
  
  console.log('Vars count:', vars.length);
  console.log('Calls count:', callsCount);
} else {
  console.log('No match found');
}
