import fs from 'fs';

let content = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');
content = content.replace(/q = query\(collection\(db, 'posts'\), where\('userId', '==', userId\), orderBy\('createdAt', 'desc'\)\);/, `q = query(collection(db, 'posts'), where('userId', '==', userId)); // Client-side sort to avoid index errors`);
content = content.replace(/const data = snap\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);/, `let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));\n      if (userId) data = data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));`);

fs.writeFileSync('src/components/PostsFeed.tsx', content);
