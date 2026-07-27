const fs = require('fs');
let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

content = content.replace(
  "{ id: 'posts', label: 'Posts', icon: Crown, count: null },\n    { id: 'logs', label: 'Logs', icon: BookOpen, count: null },",
  "{ id: 'posts', label: 'Journal', icon: BookOpen, count: null },"
);

content = content.replace(
  "if (activeTab === 'logs') {\n      return <LogsFeed userId={userId} />;\n    }",
  ""
);

content = content.replace(
  "import LogsFeed from '../components/LogsFeed';",
  ""
);

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
