const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const fetchReplacement = `fetchFromTmdb("/tv/66732"), // Stranger things
          fetchFromTmdb("/tv/popular", { page: "1" }),
          fetchFromTmdb("/tv/popular", { page: "2" }),
          fetchFromTmdb("/tv/popular", { page: "3" }),
          fetchFromTmdb("/tv/popular", { page: "4" }),
          fetchFromTmdb("/tv/popular", { page: "5" }),
          fetchFromTmdb("/tv/1399"),
          fetchFromTmdb("/tv/93405"),
          fetchFromTmdb("/tv/66732"),
          fetchFromTmdb("/tv/37680")
        ]);`;

code = code.replace(/fetchFromTmdb\("\/tv\/66732"\) \/\/ Stranger things\n\s*\]\);/, fetchReplacement);

fs.writeFileSync('src/pages/Home.tsx', code);
