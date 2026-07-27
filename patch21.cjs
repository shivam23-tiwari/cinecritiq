const fs = require('fs');

// 1. Create Logs.tsx
const logsCode = `import React from 'react';
import PostsFeed from '../components/PostsFeed';

export default function Logs() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8 border-b border-[#2c3440] pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Logs</h1>
        <p className="text-[#89a] text-sm mt-1">Share your thoughts and see logs from everyone.</p>
      </div>
      <PostsFeed />
    </div>
  );
}
`;
fs.writeFileSync('src/pages/Logs.tsx', logsCode);

// 2. Add to App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('import Logs from \'./pages/Logs\';')) {
  appCode = appCode.replace(
    'import Games from \'./pages/Games\';',
    `import Games from './pages/Games';\nimport Logs from './pages/Logs';`
  );
  appCode = appCode.replace(
    '<Route path="/community" element={<Community />} />',
    `<Route path="/community" element={<Community />} />\n            <Route path="/logs" element={<Logs />} />`
  );
  fs.writeFileSync('src/App.tsx', appCode);
}

// 3. Add to Navbar.tsx
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
if (!navCode.includes('to="/logs"')) {
  // Desktop link
  navCode = navCode.replace(
    '<Link to="/community" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#38bdf8] transition-colors">Members</Link>',
    `<Link to="/community" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#38bdf8] transition-colors">Members</Link>\n            <Link to="/logs" onClick={() => window.scrollTo(0,0)} className="text-xs xl:text-sm font-medium text-white/70 hover:text-[#38bdf8] transition-colors">Logs</Link>`
  );
  
  // Mobile link
  navCode = navCode.replace(
    '<Link to="/community" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Members</Link>',
    `<Link to="/community" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Members</Link>\n              <Link to="/logs" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0,0) }} className="text-white hover:text-[#38bdf8]">Logs</Link>`
  );
  fs.writeFileSync('src/components/Navbar.tsx', navCode);
}
console.log("Logs page added");
