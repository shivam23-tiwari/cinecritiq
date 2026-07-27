const fs = require('fs');
const content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

const oldState = `  const [customPosters, setCustomPosters] = useState<Record<string, string>>({});`;
const newState = `  const [customPosters, setCustomPosters] = useState<Record<string, string>>({});
  const [userPostsCount, setUserPostsCount] = useState<number>(0);`;

const oldTabs = `    { id: 'posts', label: 'Posts', icon: BookOpen, count: userPosts.length },`;
const newTabs = `    { id: 'posts', label: 'Posts', icon: BookOpen, count: userPostsCount },`;

let newContent = content.replace(oldState, newState);
newContent = newContent.replace(oldTabs, newTabs);

fs.writeFileSync('src/pages/PublicProfile.tsx', newContent);
