const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(/<div className="flex items-center gap-2 bg-\[#141414\] p-1 rounded-lg border border-white\/10">[\s\S]*?<\/div><\/div>/, '</div>');
code = code.replace(/No {activeTab === 'premium' \? 'premium' : 'hentai access'} requests found./, 'No premium requests found.');

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
