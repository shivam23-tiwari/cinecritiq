const fs = require('fs');
let content = fs.readFileSync('src/components/LogsFeed.tsx', 'utf8');

content = content.replace(
  '{log.review && (\\n              <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed mb-4">\\n                {log.review}\\n              </p>\\n            )}',
  `{log.review && user?.uid === log.userId && (
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider mb-1 block">Private Notes</span>
                <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">
                  {log.review}
                </p>
              </div>
            )}`
);

fs.writeFileSync('src/components/LogsFeed.tsx', content);
