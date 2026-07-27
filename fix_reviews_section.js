import fs from 'fs';

let content = fs.readFileSync('src/components/ReviewsSection.tsx', 'utf8');

content = content.replace(/      fetchLikes\(\);\n    }/g, "      fetchLikes();\n    } else {\n      setUserLikes({});\n    }");

fs.writeFileSync('src/components/ReviewsSection.tsx', content);
