import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, getDoc, doc, setDoc, deleteDoc, serverTimestamp, writeBatch, onSnapshot } from '../lib/firestore-wrapper';
import { Star, ThumbsUp, Send, Crown, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewsSection({ movieId, isReleased = true }: { movieId: number, isReleased?: boolean }) {
  const { user, userData, signInWithGoogle } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'reviews'),
      where('movieId', '==', movieId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [movieId]);

  useEffect(() => {
    if (user && reviews.length > 0) {
      // Check which reviews the user has liked
      const fetchLikes = async () => {
         const likesPromises = reviews.map(r => getDoc(doc(db, `reviews/${r.id}/likes`, user.uid)));
         const results = await Promise.all(likesPromises);
         const likesMap: Record<string, boolean> = {};
         results.forEach((snap, idx) => {
            if (snap.exists()) {
               likesMap[reviews[idx].id] = true;
            }
         });
         setUserLikes(likesMap);
      };
      fetchLikes();
    } else {
      setUserLikes({});
    }
  }, [reviews, user]);

  const fetchReviews = async () => {
    // Left empty as we use onSnapshot now
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return signInWithGoogle();
    if (!newReview.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      let isPremium = userData?.isPremium || false;

      const reviewId = doc(collection(db, 'reviews')).id;
      const reviewRef = doc(db, 'reviews', reviewId);
      
      await setDoc(reviewRef, {
        movieId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: userData?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'Anon'}`,
        isPremium,
        rating,
        content: newReview.trim(),
        likesCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, `reviews/${reviewId}`));
      
      setNewReview('');
      setRating(5);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (reviewId: string, currentLikes: number) => {
    if (!user) return signInWithGoogle();
    
    const isLiked = userLikes[reviewId];
    const likeRef = doc(db, `reviews/${reviewId}/likes`, user.uid);
    const reviewRef = doc(db, 'reviews', reviewId);
    
    // We use batch to safely mock the atomicity
    const batch = writeBatch(db);
    
    if (isLiked) {
      batch.delete(likeRef);
      batch.update(reviewRef, { likesCount: currentLikes - 1, updatedAt: serverTimestamp() });
      setUserLikes(prev => ({ ...prev, [reviewId]: false }));
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likesCount: currentLikes - 1 } : r));
    } else {
      batch.set(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
      batch.update(reviewRef, { likesCount: currentLikes + 1, updatedAt: serverTimestamp() });
      setUserLikes(prev => ({ ...prev, [reviewId]: true }));
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likesCount: currentLikes + 1 } : r));
    }
    
    await batch.commit().catch(e => {
        handleFirestoreError(e, OperationType.WRITE, `reviews/${reviewId}`);
        // Revert on error
        fetchReviews();
    });
  };

  return (
    <div className="bg-white/5 rounded-lg p-6 md:p-8 mt-12 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-8">Audience Reviews</h3>
      
      <div className="mb-10">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
             {user ? <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'Anon'}`} alt="" /> : <div className="w-full h-full" />}
          </div>
          <div className="flex-1">
             {!isReleased ? (
                <div className="bg-[#141414] p-4 rounded-xl border border-white/10 text-center">
                   <p className="text-white/60 text-sm">You can only review released movies.</p>
                </div>
             ) : (
             <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-1 mb-2">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                      <button 
                         key={star} 
                         type="button"
                         onClick={() => setRating(star)}
                         className="focus:outline-none"
                      >
                         <Star className={`w-5 h-5 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                      </button>
                   ))}
                </div>
                <div className="relative">
                   <textarea 
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder={user ? "Write your review..." : "Sign in to write a review"}
                      className="w-full bg-[#050505] border border-white/20 rounded-md p-4 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#38bdf8] min-h-[100px] resize-none text-sm transition-all shadow-inner"
                   />
                   <button 
                      type="submit"
                      disabled={submitting}
                      className="absolute bottom-4 right-4 bg-[#38bdf8] hover:bg-[#0284c7] text-white rounded p-2 transition-colors disabled:opacity-50"
                   >
                      <Send className="w-4 h-4" />
                   </button>
                </div>
             </form>
             )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
         {loading ? (
            <div className="text-center py-4 text-gray-500">Loading reviews...</div>
         ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-white/5 rounded-xl">
               No reviews yet. Be the first to share your thoughts!
            </div>
         ) : (
            reviews.map(review => (
               <div key={review.id} className="border-b border-white/5 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-3">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                           <img src={review.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(review.userId === user?.uid && userData?.displayName ? userData.displayName : review.userName)}`} alt={(review.userId === user?.uid && userData?.displayName ? userData.displayName : review.userName)} className="w-full h-full object-cover bg-white/5" />
                        </div>
                         <div>
                           <div className="text-white font-bold text-sm flex items-center gap-2">
                              {(review.userId === user?.uid && userData?.displayName ? userData.displayName : review.userName)}
                              {(review.userId === user?.uid && userData?.displayName ? userData.displayName : review.userName) === 'shivam 23' && (
                                <span className="bg-red-500/20 text-red-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Admin
                                </span>
                              )}
                              {review.isPremium && (
                                <span className="bg-gradient-to-r from-[#D4AF37] to-[#AA8529] text-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-[0_0_5px_rgba(212,175,55,0.4)] flex items-center gap-0.5">
                                  <Crown className="w-3 h-3" />
                                </span>
                              )}
                              <span className="bg-black/60 backdrop-blur-sm text-[#D4AF37] text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold border border-white/5">
                                 <Star className="w-3 h-3 fill-[#D4AF37]" />
                                 {review.rating}/10
                              </span>
                           </div>
                           <div className="text-white/40 text-[10px] uppercase mt-0.5 tracking-widest">
                              {review.createdAt?.toDate ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                           </div>
                        </div>
                     </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4 pl-13">
                     {review.content}
                  </p>
                  <div className="flex items-center gap-4 pl-13">
                     <button 
                        onClick={() => handleLike(review.id, review.likesCount)}
                        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${userLikes[review.id] ? 'text-[#38bdf8]' : 'text-white/40 hover:text-white'}`}
                     >
                        <ThumbsUp className={`w-3 h-3 ${userLikes[review.id] ? 'fill-current' : ''}`} />
                        {review.likesCount}
                     </button>
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
  );
}
