const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Remove handleHentaiApprove and handleHentaiReject
code = code.replace(/const handleHentaiApprove =.*?};\n/s, '');
code = code.replace(/const handleHentaiReject =.*?};\n/s, '');

// Remove hentaiReqs state
code = code.replace(/const \[hentaiReqs, setHentaiReqs\] = useState<any\[\]>\(\[\]\);\n/, '');

// Remove activeTab
code = code.replace(/const \[activeTab, setActiveTab\] = useState<'premium' \| 'hentai'>\('premium'\);\n/, '');

// Remove hentai requests fetch
code = code.replace(/const hQ = query\(collection\(db, 'hentaiRequests'\), orderBy\('createdAt', 'desc'\)\);\n\s*const unsubscribeH = onSnapshot\(hQ, \(snap\) => {\n\s*setHentaiReqs\(snap\.docs\.map\(doc => \({ id: doc\.id, \.\.\.doc\.data\(\) }\)\)\);\n\s*}\);\n/, '');
code = code.replace(/unsubscribeH\(\); /, '');

// Remove hentai tab button
code = code.replace(/<button\s*onClick={\(\) => setActiveTab\('hentai'\)}\s*className={`px-4 py-2 rounded-md font-bold text-sm transition-colors \${activeTab === 'hentai' \? 'bg-\[#ff385c\] text-white' : 'text-white\/70 hover:text-white'}`}\s*>\s*Hentai Requests\s*<\/button>\s*<\/div>\s*<\/div>/, '</div></div>');
code = code.replace(/<div className="flex gap-2">/, '');
code = code.replace(/<button\s*onClick={\(\) => setActiveTab\('premium'\)}\s*className={`px-4 py-2 rounded-md font-bold text-sm transition-colors \${activeTab === 'premium' \? 'bg-\[#38bdf8\] text-black' : 'text-white\/70 hover:text-white'}`}\s*>\s*Premium Requests\s*<\/button>/, '');


code = code.replace(/\(activeTab === 'premium' \? requests : hentaiReqs\)/g, 'requests');

code = code.replace(/onClick={\(\) => activeTab === 'premium' \? handleApprove\(req\.id, req\.userId\) : handleHentaiApprove\(req\.id, req\.userId\)}/g, 'onClick={() => handleApprove(req.id, req.userId)}');
code = code.replace(/onClick={\(\) => activeTab === 'premium' \? handleReject\(req\.id\) : handleHentaiReject\(req\.id\)}/g, 'onClick={() => handleReject(req.id)}');


fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
