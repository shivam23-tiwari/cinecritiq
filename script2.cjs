const fs = require('fs');
const content = fs.readFileSync('src/pages/AnimePage.tsx', 'utf8');

const newContent = content.replace(
  /const \[hasMore, setHasMore\] = useState\(true\);/,
  `const [hasMore, setHasMore] = useState(true);
  const [hentaiSort, setHentaiSort] = useState<'liked' | 'watched'>('liked');`
).replace(
  /<button \n          onClick=\{\(\) => setActiveTab\('hentai'\)\}\n          className=\{`px-6 py-2\.5 rounded-full font-bold transition-all \$\{activeTab === 'hentai' \? 'bg-\[\#ff385c\] text-white' : 'bg-white\/10 text-white hover:bg-white\/20'\}`\}\n        >\n          Hentai\n        <\/button>\n      <\/div>/,
  `<button 
          onClick={() => setActiveTab('hentai')}
          className={\`px-6 py-2.5 rounded-full font-bold transition-all \${activeTab === 'hentai' ? 'bg-[#ff385c] text-white' : 'bg-white/10 text-white hover:bg-white/20'}\`}
        >
          Hentai
        </button>
      </div>
      
      {activeTab === 'hentai' && (
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => setHentaiSort('liked')}
            className={\`px-4 py-1.5 rounded-md text-sm font-bold transition-all \${hentaiSort === 'liked' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}\`}
          >
            Top Most Liked
          </button>
          <button 
            onClick={() => setHentaiSort('watched')}
            className={\`px-4 py-1.5 rounded-md text-sm font-bold transition-all \${hentaiSort === 'watched' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}\`}
          >
            Top Most Watched
          </button>
        </div>
      )}`
).replace(
  /\{\[\.\.\.hentaiAnime\]\.sort\(\(a: any, b: any\) => \(b\.vote_average \|\| 0\) - \(a\.vote_average \|\| 0\)\)\.map\(\(movie: any, idx: number\) => \(/,
  `{[...hentaiAnime].sort((a: any, b: any) => hentaiSort === 'liked' ? (b.vote_average || 0) - (a.vote_average || 0) : (b.popularity || 0) - (a.popularity || 0)).map((movie: any, idx: number) => (`
);

fs.writeFileSync('src/pages/AnimePage.tsx', newContent);
