const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

content = content.replace(
  "{ id: 'posts', label: 'Posts', icon: Grid, count: userPosts.length },\n    { id: 'logs', label: 'Logs', icon: BookOpen, count: null },",
  "{ id: 'posts', label: 'Journal', icon: BookOpen, count: null }," // Combining them, count is hard to track without fetching both, so let's set count to null or just let it use null
);

content = content.replace(
  "if (activeTab === 'logs') {\n      return (\n        <div className=\"max-w-3xl mx-auto\">\n           <LogsFeed userId={user.uid} />\n        </div>\n      );\n    }",
  ""
);

content = content.replace(
  "import LogsFeed from '../components/LogsFeed';",
  ""
);

fs.writeFileSync('src/pages/Profile.tsx', content);
