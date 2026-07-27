const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(
  '<Link to="/community" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#38bdf8] transition-colors">Members</Link>',
  '<Link to="/community" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#38bdf8] transition-colors">Journal</Link>'
);

content = content.replace(
  '<Link to="/community" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Members</Link>',
  '<Link to="/community" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Journal</Link>'
);

fs.writeFileSync('src/components/Navbar.tsx', content);
