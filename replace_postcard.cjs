const fs = require('fs');
const content = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');

const startIndex = content.indexOf('function PostCard(');

const newPostCard = `function PostCard({ post, currentUser, onDelete }: { post: any, currentUser: any, onDelete: () => void }) {
  const { userData } = useAuth();
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  const collectionName = post.feedType === 'log' ? 'logs' : 'posts';

  useEffect(() => {
    if (!currentUser) {
      setHasLiked(false);
      return;
    }
    const checkLike = async () => {
      try {
        const q = query(collection(db, collectionName, post.id, 'likes'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        setHasLiked(!snap.empty);
      } catch (e) {
        // Ignored
      }
    };
    checkLike();
  }, [currentUser, post.id, collectionName]);

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      const likeRef = doc(db, collectionName, post.id, 'likes', currentUser.uid);
      if (hasLiked) {
        await deleteDoc(likeRef);
        setHasLiked(false);
        setLikesCount(p => Math.max(0, p - 1));
      } else {
        await setDoc(likeRef, { userId: currentUser.uid, createdAt: serverTimestamp() });
        setHasLiked(true);
        setLikesCount(p => p + 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const q = query(collection(db, collectionName, post.id, 'comments'), orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(q, (snap) => {
        setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setCommentsLoading(false);
      });
      return unsub;
    } catch (e) {
      console.error(e);
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentText.trim()) return;
    try {
      let isPremium = userData?.isPremium || false;
      const commentId = doc(collection(db, collectionName, post.id, 'comments')).id;
      const commentRef = doc(db, collectionName, post.id, 'comments', commentId);
      await setDoc(commentRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userPhoto: currentUser.photoURL || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${currentUser.displayName}\`,
        isPremium,
        content: commentText.trim(),
        createdAt: serverTimestamp()
      });
      setCommentText('');
    } catch (error) {
      console.error(error);
    }
  };

  const renderContentWithHashtags = (text: string) => {
    if (!text) return null;
    return text.split(/(#[a-zA-Z0-9_]+)/g).map((part, i) => {
      if (part.startsWith('#')) {
        return <span key={i} className="text-[#38bdf8] hover:underline cursor-pointer">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderMovies = () => {
    const movies = post.movies && post.movies.length > 0 ? post.movies : (
      post.movieId ? [{ id: post.movieId, title: post.movieTitle, poster: post.moviePoster, media_type: 'movie' }] : []
    );
    if (movies.length === 0) return null;
    return (
      <div className={\`grid gap-2 \${movies.length > 1 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 max-w-[200px]'}\`}>
        {movies.map((m: any, idx: number) => (
          <Link key={idx} to={\`/movie/\${m.id}?type=\${m.media_type || 'movie'}\`} className="group block relative rounded-lg overflow-hidden border border-white/10 aspect-[2/3] bg-[#2c3440]">
            <img referrerPolicy="no-referrer" src={m.poster || \`https://via.placeholder.com/200x300\`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={m.title || "Poster"} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-12">
              <p className="text-white text-xs md:text-sm font-bold truncate">{m.title}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  let innerContent;
  if (post.feedType === 'log') {
    innerContent = (
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-[#38bdf8] font-bold text-sm uppercase tracking-widest">Logged</span>
          <h3 className="text-xl font-bold text-white leading-tight">{post.movieName}</h3>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-white/50 mb-4 bg-white/5 inline-flex px-3 py-1.5 rounded-lg w-max">
          <span>Watched: {post.date}</span>
          {post.rating > 0 && (
            <div className="flex items-center gap-1 border-l border-white/10 pl-4">
              <span className="text-[#00E054]">★</span>
              <span>{post.rating}/5</span>
            </div>
          )}
        </div>
        
        {post.review && (
          <div className="mb-4 bg-[#2c3440] p-4 rounded-xl border border-white/5 relative">
            {currentUser?.uid === post.userId && <span className="absolute -top-2 left-4 bg-[#1a1f26] px-2 text-[9px] uppercase font-bold text-white/30 tracking-wider">Private Notes</span>}
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
    );
  } else {
    innerContent = (
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="text-white/90 whitespace-pre-wrap text-[15px] md:text-base font-serif leading-relaxed">
          {renderContentWithHashtags(post.content || '')}
        </div>
        {renderMovies()}
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f26] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={\`/user/\${post.userId}\`}>
            <img referrerPolicy="no-referrer" src={post.userPhoto} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-white/10" alt="User" />
          </Link>
          <div>
            <Link to={\`/user/\${post.userId}\`} className="text-white font-bold hover:text-[#38bdf8] flex items-center gap-2">
              {post.userName}
              {post.isPremium && (
                <span className="bg-gradient-to-r from-[#D4AF37] to-[#AA8529] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-[0_0_5px_rgba(212,175,55,0.4)] flex items-center gap-0.5">
                  <Crown className="w-3 h-3" />
                </span>
              )}
            </Link>
            <p className="text-white/40 text-[11px] md:text-xs">
              {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
            </p>
          </div>
        </div>
        {currentUser?.uid === post.userId && (
          <button onClick={onDelete} className="text-white/20 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/5">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {innerContent}

      <div className="px-4 py-3 border-t border-white/5 flex items-center gap-6">
        <button 
          onClick={handleLike}
          className={\`flex items-center gap-2 text-sm font-bold transition-colors \${hasLiked ? 'text-[#e50914]' : 'text-white/40 hover:text-white'}\`}
        >
          <Heart className={\`w-5 h-5 \${hasLiked ? 'fill-[#e50914] text-[#e50914]' : ''}\`} />
          {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
        </button>
        <button 
          onClick={toggleComments}
          className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          Comment
        </button>
      </div>
      {showComments && (
        <div className="p-4 md:p-6 bg-black/20 border-t border-white/5 space-y-4">
          {commentsLoading ? (
            <div className="text-center text-white/50 text-sm">Loading comments...</div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3 group">
                  <Link to={\`/user/\${c.userId}\`}>
                    <img referrerPolicy="no-referrer" src={c.userPhoto} className="w-8 h-8 rounded-full border border-white/10" alt="User" />
                  </Link>
                  <div className="flex-1">
                    <div className="bg-white/5 px-4 py-2.5 rounded-2xl rounded-tl-sm inline-block max-w-[90%] md:max-w-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={\`/user/\${c.userId}\`} className="font-bold text-white text-xs hover:text-[#38bdf8]">{c.userName}</Link>
                      </div>
                      <span className="text-white/80 text-sm break-words">{c.content}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/40 text-sm py-4">No comments yet. Be the first to comment!</div>
          )}
          
          {currentUser && (
            <form onSubmit={handlePostComment} className="flex gap-3 mt-4 pt-4 border-t border-white/5">
              <img referrerPolicy="no-referrer" src={currentUser.photoURL || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${currentUser.displayName}\`} className="w-9 h-9 rounded-full object-cover" alt="You" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-[#2c3440] border border-white/10 rounded-full pl-4 pr-12 py-2 text-sm text-white focus:border-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]/50 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#38bdf8] disabled:opacity-50 hover:bg-white/5 rounded-full transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
`;

const newContent = content.substring(0, startIndex) + newPostCard;
fs.writeFileSync('src/components/PostsFeed.tsx', newContent);
