import fs from 'fs';

for (const file of ['src/pages/Profile.tsx', 'src/pages/PublicProfile.tsx']) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/emptyMessage = "You haven't rated any films yet\.";/, ``);
  content = content.replace(/return <EmptyState message="No movies found in this list." \/>;/, `return <EmptyState message={activeTab === 'ratings' ? "You haven't rated any films yet." : "No movies found in this list."} />;`);
  fs.writeFileSync(file, content);
}
