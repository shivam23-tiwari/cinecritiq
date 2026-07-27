const fs = require('fs');
let code = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');

code = code.replace(
  'function PostCard({ post, currentUser, onDelete }: { post: Post, currentUser: any, onDelete: () => void }) {',
  `function PostCard({ post, currentUser, onDelete }: { post: any, currentUser: any, onDelete: () => void }) {
  if (post.feedType === 'log') {
    return (
      <div className="bg-[#1a1f26] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-xl">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <Link to={\`/user/\${post.userId}\`}>
                <img referrerPolicy="no-referrer" src={post.userPhoto || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="User" />
              </Link>
              <div>
                <Link to={\`/user/\${post.userId}\`} className="text-white font-bold hover:text-[#38bdf8]">{post.userName || 'Anonymous'}</Link>
                <div className="text-white/40 text-[11px] md:text-xs">
                  {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                </div>
              </div>
            </div>
            {currentUser?.uid === post.userId && (
              <button onClick={() => {
                if (window.confirm('Delete this log?')) {
                  deleteDoc(doc(db, 'logs', post.id));
                }
              }} className="text-white/20 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/5">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-white/50 text-sm">logged</span>
            <h3 className="text-xl font-bold text-white leading-tight">{post.movieName}</h3>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-white/50 mb-4 bg-white/5 inline-flex px-3 py-1.5 rounded-lg">
            <span>Watched: {post.date}</span>
            {post.rating > 0 && (
              <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                <span className="text-[#00E054]">★</span>
                <span>{post.rating}/5</span>
              </div>
            )}
          </div>
          
          {post.review && currentUser?.uid === post.userId && (
            <div className="mb-4 bg-[#2c3440] p-4 rounded-xl border border-white/5 relative">
              <span className="absolute -top-2 left-4 bg-[#1a1f26] px-2 text-[9px] uppercase font-bold text-white/30 tracking-wider">Private Notes</span>
              <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed font-serif">
                {post.review}
              </p>
            </div>
          )}
          
          {post.hasFile && post.fileData && (
            <div className="mt-4 max-w-sm rounded-lg overflow-hidden border border-white/10">
              <img src={post.fileData} alt="Log attachment" className="w-full h-auto" />
            </div>
          )}
        </div>
      </div>
    );
  }
`
);

fs.writeFileSync('src/components/PostsFeed.tsx', code);
