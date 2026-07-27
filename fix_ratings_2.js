import fs from 'fs';

for (const file of ['src/pages/Profile.tsx', 'src/pages/PublicProfile.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\} else if \(activeTab === 'ratings'\) \{\n      items = ratings;\n      emptyMessage = "You haven't rated any films yet.";/, `} else if (activeTab === 'ratings') {\n       activeList = ratings;\n       emptyMessage = "You haven't rated any films yet.";`);
  fs.writeFileSync(file, content);
}
