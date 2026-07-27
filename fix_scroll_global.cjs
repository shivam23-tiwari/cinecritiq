const fs = require('fs');

function processFile(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  // First, avoid double-adding if we run this script repeatedly
  code = code.replace(/overscroll-x-contain /g, '');
  code = code.replace(/className="overflow-x-auto/g, 'className="overflow-x-auto overscroll-x-contain');
  fs.writeFileSync(file, code);
}

processFile('src/pages/Home.tsx');
processFile('src/pages/Movies.tsx');
processFile('src/pages/Series.tsx');
processFile('src/pages/MovieDetails.tsx');
processFile('src/pages/PersonPage.tsx');
processFile('src/pages/YearPage.tsx');
processFile('src/components/ActorModal.tsx');
processFile('src/components/MovieRow.tsx');

