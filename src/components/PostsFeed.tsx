import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, setDoc, doc, serverTimestamp, onSnapshot, deleteDoc, getDocs } from '../lib/firestore-wrapper';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';
import { getImageUrl, fetchFromTmdb } from '../lib/tmdb';
import { Heart, MessageSquare, Search, X, Loader2, Send, Trash2, Crown, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  movies?: { id: number; title: string; poster: string; media_type?: string }[];
  movieId?: number;
  movieTitle?: string;
  moviePoster?: string;
  likesCount: number;
  createdAt: any;
  isPremium?: boolean;
}

interface PostsFeedProps {
  userId?: string; 
}

export default function PostsFeed({ userId }: PostsFeedProps) {
  const { user, userData } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [movieSearchTerm, setMovieSearchTerm] = useState('');
  const [movieSearchResults, setMovieSearchResults] = useState<any[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let postsQuery;
    if (userId) {
      postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
    } else {
      postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    }

    let logsQuery;
    if (userId) {
      logsQuery = query(collection(db, 'logs'), where('userId', '==', userId));
    } else {
      logsQuery = query(collection(db, 'logs'), orderBy('createdAt', 'desc'));
    }

    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data(), feedType: 'post' } as any));
      
      onSnapshot(logsQuery, (logsSnapshot) => {
        const l = logsSnapshot.docs.map(d => ({ id: d.id, ...d.data(), feedType: 'log' } as any));
        
        const combined = [...p, ...l].sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setPosts(combined);
        setLoading(false);
      });
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubPosts();
  }, [userId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (movieSearchTerm.trim().length > 2) {
        try {
          const res = await fetchFromTmdb('/search/multi', { query: movieSearchTerm, include_adult: 'false' });
          setMovieSearchResults((res.results || []).filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv'));
        } catch (error) {
          console.error(error);
        }
      } else {
        setMovieSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [movieSearchTerm]);

  const handleCreatePost = async () => {
    if (!user || !postContent.trim() || selectedMovies.length === 0) return;
    setIsSubmitting(true);
    try {
      let isPremium = userData?.isPremium || false;
      const postId = doc(collection(db, 'posts')).id;
      const postRef = doc(db, 'posts', postId);
      
      const moviesData = selectedMovies.map(m => ({
        id: m.id,
        title: m.title || m.name,
        poster: m.poster_path ? getImageUrl(m.poster_path, 'w500') : '',
        media_type: m.media_type || 'movie'
      }));

      await setDoc(postRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: userData?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'Anon'}`,
        isPremium,
        content: postContent.trim(),
        movies: moviesData,
        likesCount: 0,
        createdAt: serverTimestamp()
      });

      setShowCreateModal(false);
      setPostContent('');
      setSelectedMovies([]);
      setMovieSearchTerm('');
    } catch (error) {
      console.error(error);
      alert("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (window.confirm("Delete this post?")) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleMovieSelect = (m: any) => {
    if (selectedMovies.some(sm => sm.id === m.id)) {
      setSelectedMovies(selectedMovies.filter(sm => sm.id !== m.id));
    } else if (selectedMovies.length < 4) {
      setSelectedMovies([...selectedMovies, m]);
    }
    setMovieSearchTerm('');
    setMovieSearchResults([]);
  };

  if (loading) {
    return <div className="py-8 text-center text-white/50">Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      {user && (!userId || user.uid === userId) && (
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 cursor-text" onClick={() => setShowCreateModal(true)}>
          <img referrerPolicy="no-referrer" src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} className="w-10 h-10 rounded-full object-cover" alt="User" />
          <div className="flex-1 text-white/50 bg-black/30 rounded-full px-4 py-2 hover:bg-black/50 transition-colors">
            Post something...
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-10 text-white/50">No posts yet.</div>
      ) : (
        <div className="space-y-8">
          {posts.map(post => (
            <PostCard key={post.id} post={post} currentUser={user} onDelete={() => deletePost(post.id)} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 p-6 rounded-xl w-full max-w-lg relative max-h-[90vh] flex flex-col">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">New Post</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div>
                <label className="text-sm text-white/70 block mb-2 font-semibold">Select up to 4 movies/series to write about:</label>
                {selectedMovies.length < 4 && (
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={movieSearchTerm}
                      onChange={(e) => setMovieSearchTerm(e.target.value)}
                      placeholder="Search titles..."
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#38bdf8] focus:outline-none"
                    />
                    {movieSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[#1c2430] border border-white/10 rounded-lg max-h-60 overflow-y-auto shadow-2xl">
                        {movieSearchResults.map((item: any, _idx: number) => (
                          <div
                            key={`${item.id}-${_idx}`}
                            className="p-2 flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => handleMovieSelect(item)}
                          >
                            <img referrerPolicy="no-referrer" src={item.poster_path ? getImageUrl(item.poster_path, 'w200') : `https://via.placeholder.com/200x300`} className="w-10 h-14 object-cover rounded" alt="Poster" />
                            <div>
                              <p className="text-white font-medium">{item.title || item.name}</p>
                              <p className="text-white/50 text-xs">{item.release_date || item.first_air_date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {selectedMovies.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-2">
                    {selectedMovies.map(sm => (
                      <div key={sm.id} className="relative w-16 h-24 rounded-md overflow-hidden border border-white/10 shrink-0">
                        <img referrerPolicy="no-referrer" src={sm.poster_path ? getImageUrl(sm.poster_path, 'w200') : `https://via.placeholder.com/200x300`} className="w-full h-full object-cover" alt="Poster" />
                        <button type="button" onClick={() => setSelectedMovies(selectedMovies.filter(m => m.id !== sm.id))} className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full hover:bg-black text-white backdrop-blur">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your post here... Thoughts, theories, reviews?"
                className="w-full h-40 bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#38bdf8] focus:outline-none resize-none"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting || !postContent.trim() || selectedMovies.length === 0}
                className="px-6 py-2 bg-[#38bdf8] text-white rounded-lg font-bold hover:bg-[#0284c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, currentUser, onDelete }: { post: any, currentUser: any, onDelete: () => void }) {
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
        userPhoto: userData?.photoURL || currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`,
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
      <div className={`grid gap-2 ${movies.length > 1 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 max-w-[200px]'}`}>
        {movies.map((m: any, idx: number) => (
          <Link key={idx} to={`/movie/${m.id}?type=${m.media_type || 'movie'}`} className="group block relative rounded-lg overflow-hidden border border-white/10 aspect-[2/3] bg-[#2c3440]">
            <img referrerPolicy="no-referrer" src={m.poster || `https://via.placeholder.com/200x300`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={m.title || "Poster"} />
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
          <Link to={`/user/${post.userId}`}>
            <img referrerPolicy="no-referrer" src={post.userPhoto} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-white/10" alt="User" />
          </Link>
          <div>
            <Link to={`/user/${post.userId}`} className="text-white font-bold hover:text-[#38bdf8] flex items-center gap-2">
              {post.userName}
              {post.userName === 'shivam 23' && (
                <span className="bg-red-500/20 text-red-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Admin
                </span>
              )}
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
          className={`flex items-center gap-2 text-sm font-bold transition-colors ${hasLiked ? 'text-[#e50914]' : 'text-white/40 hover:text-white'}`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-[#e50914] text-[#e50914]' : ''}`} />
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
                  <Link to={`/user/${c.userId}`}>
                    <img referrerPolicy="no-referrer" src={c.userPhoto} className="w-8 h-8 rounded-full border border-white/10" alt="User" />
                  </Link>
                  <div className="flex-1">
                    <div className="bg-white/5 px-4 py-2.5 rounded-2xl rounded-tl-sm inline-block max-w-[90%] md:max-w-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/user/${c.userId}`} className="font-bold text-white text-xs hover:text-[#38bdf8] flex items-center gap-1">
                          {c.userName}
                          {c.userName === 'shivam 23' && (
                            <span className="bg-red-500/20 text-red-500 text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Admin
                            </span>
                          )}
                        </Link>
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
              <img referrerPolicy="no-referrer" src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`} className="w-9 h-9 rounded-full object-cover" alt="You" />
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
