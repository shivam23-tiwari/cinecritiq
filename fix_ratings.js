import fs from 'fs';

for (const file of ['src/pages/Profile.tsx', 'src/pages/PublicProfile.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\} else if \(activeTab === 'watched'\) \{/, `} else if (activeTab === 'ratings') {
      items = ratings;
      emptyMessage = "You haven't rated any films yet.";
    } else if (activeTab === 'watched') {`);
  fs.writeFileSync(file, content);
}
