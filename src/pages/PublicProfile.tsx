import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, getDoc, where, setDoc, deleteDoc, serverTimestamp } from '../lib/firestore-wrapper';
import { useAuth } from '../lib/AuthContext';
import { Heart, Clock, Eye, Star, BookOpen, Crown, Instagram, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getImageUrl } from '../lib/tmdb';
import PostsFeed from '../components/PostsFeed';

import MovieCard from '../components/MovieCard';

const AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=E50914",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka&backgroundColor=4338ca",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Mimi&backgroundColor=047857",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Jack&backgroundColor=be185d",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Jude&backgroundColor=0f766e",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Leo&backgroundColor=b45309"
];

type TabType = 'top4' | 'films' | 'diary' | 'reviews' | 'watchlist' | 'posts' | 'watched' | 'ratings';

export default function PublicProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState<any>({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watched, setWatched] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [diary, setDiary] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [customPosters, setCustomPosters] = useState<Record<string, string>>({});
  const [userPostsCount, setUserPostsCount] = useState<number>(0);
  
  const [activeTab, setActiveTab] = useState<TabType>('top4');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user && userId && user.uid !== userId) {
      const followDocRef = doc(db, `users/${userId}/followers/${user.uid}`);
      getDoc(followDocRef).then(snap => {
        setIsFollowing(snap.exists());
      }).catch(e => {
        if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) console.error(e); else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
      });
    }
  }, [user, userId]);
  
  const handleFollowToggle = async () => {
    if (!user || !userId || user.uid === userId || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      const followerRef = doc(db, `users/${userId}/followers/${user.uid}`);
      const followingRef = doc(db, `users/${user.uid}/following/${userId}`);

      if (isFollowing) {
        await deleteDoc(followerRef);
        await deleteDoc(followingRef);
        setIsFollowing(false);
        setFollowers(prev => Math.max(0, prev - 1));
      } else {
        await setDoc(followerRef, {
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        await setDoc(followingRef, {
          userId: userId,
          createdAt: serverTimestamp()
        });
        setIsFollowing(true);
        setFollowers(prev => prev + 1);

        // Add notification
        const notificationRef = doc(collection(db, 'notifications'));
        await setDoc(notificationRef, {
          userId: userId,
          type: 'follow',
          fromUserId: user.uid,
          fromUserName: user.displayName || 'Anonymous User',
          createdAt: serverTimestamp(),
          read: false
        });
      }
    } catch (e) {
      if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) {
        console.error("Follow error:", e);
      } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
    } finally {
      setIsFollowLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    
    setFetching(true);
    
    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfileData(userSnap.data());
        }

        const followersQuery = query(collection(db, `users/${userId}/followers`));
        const followingQuery = query(collection(db, `users/${userId}/following`));
        getDocs(followersQuery).then(s => setFollowers(s.size)).catch(() => {});
        getDocs(followingQuery).then(s => setFollowing(s.size)).catch(() => {});

        // Fetch actions
        const actionsQ = query(collection(db, `users/${userId}/movieActions`));
        let snap = null;
        try {
           snap = await getDocs(actionsQ);
        } catch (e) {
           console.error(e);
        }
        
        const legacyCollections = ['favorites', 'watchlist', 'watched', 'ratings', 'diary'];
        const legacyPromises = legacyCollections.map(colName => 
           getDocs(query(collection(db, `users/${userId}/${colName}`))).catch(() => null)
        );
        const legacySnaps = await Promise.all(legacyPromises);
        
        const favsMap = new Map();
        const watchMap = new Map();
        const seenMap = new Map();
        const rateMap = new Map();
        const diaryMap = new Map();
        const posters: Record<string, string> = {};

        const processDocs = (docs: any[], defaultType?: string) => {
          docs.forEach(doc => {
            const data = doc.data();
            let movieObj = {
               id: data.movieId || data.id || parseInt(doc.id) || doc.id.replace(defaultType + '_', ''),
               title: data.movieData?.title || data.movieData?.name || data.title || data.name,
               poster_path: data.movieData?.poster_path || data.poster_path,
               backdrop_path: data.movieData?.backdrop_path || data.backdrop_path,
               createdAt: data.createdAt?.toDate(),
               rating: data.rating,
               text: data.text,
               customPosterUrl: data.customPosterUrl
            };
            
            let actionType = data.actionType || defaultType;

            if (actionType === 'customPoster' && data.customPosterUrl) {
              posters[movieObj.id] = data.customPosterUrl;
            }
            if (actionType === 'favorite') favsMap.set(movieObj.id, movieObj);
            if (actionType === 'watchlist') watchMap.set(movieObj.id, movieObj);
            if (actionType === 'watched') seenMap.set(movieObj.id, movieObj);
            if (actionType === 'rated') {
               seenMap.set(movieObj.id, movieObj);
               rateMap.set(movieObj.id, movieObj);
            }
            if (actionType === 'diary') {
               seenMap.set(movieObj.id, movieObj);
               diaryMap.set(movieObj.id, movieObj);
            }
          });
        };
        
        if (snap && snap.docs) processDocs(snap.docs);
        legacySnaps.forEach((lSnap, idx) => {
           if (lSnap && lSnap.docs) {
              processDocs(lSnap.docs, legacyCollections[idx] === 'favorites' ? 'favorite' : legacyCollections[idx]);
           }
        });

        setCustomPosters(posters);
        setFavorites(Array.from(favsMap.values()).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));
        setWatchlist(Array.from(watchMap.values()).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));
        setWatched(Array.from(seenMap.values()).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));
        setRatings(Array.from(rateMap.values()).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));
        setDiary(Array.from(diaryMap.values()).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));

        // Fetch reviews
        const revQ = query(collection(db, 'reviews'), where('userId', '==', userId));
        const revSnap = await getDocs(revQ);
        setReviews(revSnap.docs.map(d => ({id: d.id, ...d.data()})));
        
      } catch (e) {
        if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) {
          console.error(e);
        } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
      } finally {
        setFetching(false);
      }
    };
    
    fetchData();
  }, [userId]);

  if (fetching) {
    return <div className="pt-24 text-center text-white">Loading...</div>;
  }

  const tabs = [
    { id: 'top4', label: 'Favorites 4', icon: Star, count: null },
    { id: 'watched', label: 'Films', icon: Eye, count: watched.length },
    { id: 'ratings', label: 'Ratings', icon: Star, count: ratings.length },
    { id: 'films', label: 'Liked Films', icon: Heart, count: favorites.length },
    { id: 'diary', label: 'Diary', icon: BookOpen, count: diary.length },
    { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
    { id: 'watchlist', label: 'Watchlist', icon: Clock, count: watchlist.length },
    { id: 'posts', label: 'Posts', icon: BookOpen, count: userPostsCount },
  ];

  const renderTabContent = () => {
    if (activeTab === 'top4') {
      const allMoviesMap = new Map();
      [...watched, ...favorites, ...diary, ...ratings].forEach((m: any) => {
        if (!allMoviesMap.has(String(m.id))) {
           allMoviesMap.set(String(m.id), { ...m, rating: 0, isFav: false });
        }
      });
      favorites.forEach((m: any) => {
        if (allMoviesMap.has(String(m.id))) allMoviesMap.get(String(m.id)).isFav = true;
      });
      ratings.forEach((m: any) => {
        if (allMoviesMap.has(String(m.id))) allMoviesMap.get(String(m.id)).rating = m.rating || 0;
      });
      const top4 = Array.from(allMoviesMap.values()).sort((a: any, b: any) => {
        if ((b.rating || 0) !== (a.rating || 0)) {
            return (b.rating || 0) - (a.rating || 0);
        }
        if (b.isFav !== a.isFav) {
            return b.isFav ? 1 : -1;
        }
        return (b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0)) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0));
      }).slice(0, 4);
      return (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 py-4">
          {top4.map((m: any) => (
             <Link key={m.id} to={`/movie/${m.id}`} className="w-full relative aspect-[2/3] rounded-lg overflow-hidden group">
                <img referrerPolicy="no-referrer" src={customPosters[m.id] || getImageUrl(m.poster_path)} alt={m.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
             </Link>
          ))}
        </div>
      );
    }
    if (activeTab === 'watched') {
       return (
         <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 py-4">
           {watched.map((m, idx) => (
             <div key={`${m.id}-${idx}`}><MovieCard movie={{ id: m.id, title: m.title, poster_path: customPosters[m.id] || m.poster_path, vote_average: 0, release_date: "", genre_ids: [] }} userRating={ratings.find((r: any) => r.id === m.id)?.rating} hideGlobalRating={true} /></div>
           ))}
         </div>
       );
    }
    if (activeTab === 'films') {
       return (
         <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 py-4">
           {favorites.map((m, idx) => (
             <div key={`${m.id}-${idx}`}><MovieCard movie={{ id: m.id, title: m.title, poster_path: customPosters[m.id] || m.poster_path, vote_average: 0, release_date: "", genre_ids: [] }} userRating={ratings.find((r: any) => r.id === m.id)?.rating} hideGlobalRating={true} /></div>
           ))}
         </div>
       );
    }
    if (activeTab === 'ratings') {
       return (
         <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 py-4">
           {ratings.map((m, idx) => (
             <div key={`${m.id}-${idx}`}><MovieCard movie={{ id: m.id, title: m.title, poster_path: customPosters[m.id] || m.poster_path, vote_average: 0, release_date: "", genre_ids: [] }} userRating={m.rating} hideGlobalRating={true} /></div>
           ))}
         </div>
       );
    }
    if (activeTab === 'watchlist') {
       return (
         <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 py-4">
           {watchlist.map((m, idx) => (
             <div key={`${m.id}-${idx}`}><MovieCard movie={{ id: m.id, title: m.title, poster_path: customPosters[m.id] || m.poster_path, vote_average: 0, release_date: "", genre_ids: [] }} hideGlobalRating={true} /></div>
           ))}
         </div>
       );
    }
    if (activeTab === 'reviews') {
       return (
         <div className="space-y-6">
           {reviews.map(r => {
             const m = watched.find(w => w.id === r.movieId) || r;
             return (
               <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex gap-6">
                 <Link to={`/movie/${r.movieId}`} className="shrink-0 w-24 md:w-32 rounded-lg overflow-hidden block">
                   <img referrerPolicy="no-referrer" src={customPosters[r.movieId] || getImageUrl(m.poster_path)} className="w-full h-auto" />
                 </Link>
                 <div>
                   <h3 className="text-xl font-bold text-white mb-2">{m.title || 'Movie'}</h3>
                   <div className="flex text-[#38bdf8] mb-2">
                     {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= r.rating ? 'fill-current' : 'text-white/20'}`} />)}
                   </div>
                   <p className="text-white/80 whitespace-pre-wrap">{r.content}</p>
                 </div>
               </div>
             );
           })}
         </div>
       );
    }
    if (activeTab === 'diary') {
       return (
         <div className="space-y-6">
           {diary.map(d => (
             <div key={d.id} className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 group relative">
               <Link to={`/movie/${d.id}`} className="w-24 md:w-32 shrink-0 rounded-lg overflow-hidden block">
                 <img referrerPolicy="no-referrer" src={customPosters[d.id] || getImageUrl(d.poster_path)} className="w-full h-auto group-hover:scale-105 transition-transform" />
               </Link>
               <div>
                 <Link to={`/movie/${d.id}`} className="text-xl font-bold text-white hover:text-[#38bdf8] transition-colors">{d.title}</Link>
                 <p className="text-white/80 whitespace-pre-wrap mt-2">{d.text}</p>
               </div>
             </div>
           ))}
         </div>
       );
    }
    if (activeTab === 'posts') {
      return <PostsFeed userId={userId} />;
    }
    
    return null;
  };

  return (
    <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Profile section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-12 p-4 md:p-8 bg-black/40 rounded-xl border border-white/5 relative shadow-xl">
          
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-red-600 shrink-0 shadow-lg bg-neutral-900">
            <img referrerPolicy="no-referrer"
              src={profileData.photoURL || AVATARS[0]}
              alt={profileData.displayName || "Profile"}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = AVATARS[0]; }}
            />
          </div>
          
          <div className="text-left flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  {profileData.displayName || 'User'}
                  {watched.length >= 1000 && (
                     <span title="Verified (1000+ Films)" className="inline-flex">
                       <CheckCircle2 className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                     </span>
                  )}
                  {profileData.displayName === 'shivam 23' && (
                    <span className="bg-green-500/20 text-green-500 text-[10px] md:text-xs font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Admin
                    </span>
                  )}
                  {profileData.isPremium && (
                    <span className="bg-gradient-to-r from-[#D4AF37] to-[#AA8529] text-black text-[10px] md:text-xs font-bold px-2 py-1 rounded uppercase tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.4)] flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                    </span>
                  )}
                </h1>
                
                {(profileData.mcqWinnerStarUntil && (
                  (typeof profileData.mcqWinnerStarUntil.toMillis === 'function' && profileData.mcqWinnerStarUntil.toMillis() > Date.now()) ||
                  (typeof profileData.mcqWinnerStarUntil.getTime === 'function' && profileData.mcqWinnerStarUntil.getTime() > Date.now()) ||
                  (typeof profileData.mcqWinnerStarUntil === 'number' && profileData.mcqWinnerStarUntil > Date.now())
                )) && (
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded font-bold uppercase tracking-wider">
                    GOAT
                  </span>
                )}

              </div>
              
              {user && user.uid !== userId && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                    isFollowing 
                      ? 'bg-white/10 hover:bg-red-500/20 text-white hover:text-red-500 border border-white/20 hover:border-red-500/50' 
                      : 'bg-[#38bdf8] hover:bg-[#b0070f] text-white'
                  }`}
                >
                  {isFollowLoading ? 'Wait...' : isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-2 mt-2 mb-4">
              {profileData.instagramUsername && (
                <a 
                  href={`https://instagram.com/${profileData.instagramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-start gap-2 text-[#E1306C] text-xs md:text-base font-medium hover:text-[#c1265b] transition-colors"
                >
                  <Instagram className="w-4 h-4" /> 
                  <span>@{profileData.instagramUsername.replace('@', '')}</span>
                </a>
              )}
              
              <div className="flex items-center justify-start gap-2 md:gap-4 mt-2">
                 <div className="flex items-center gap-1.5">
                    <span className="text-white/50 text-xs md:text-sm">Status:</span>
                    <span className={`text-xs md:text-sm font-bold ${profileData?.isPremium ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                       {profileData?.isPremium ? 'Pro State' : 'Normal State'}
                    </span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="text-white/50 text-xs md:text-sm">Activity Level:</span>
                    <div className="flex">
                       {[1,2,3,4,5].map(star => (
                         <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.min(5, Math.ceil((watched.length + ratings.length) / 5)) ? 'text-[#38bdf8] fill-[#38bdf8]' : 'text-white/20'}`} />
                       ))}
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/90 text-xs md:text-sm font-medium">
              <span><strong className="text-white text-sm md:text-lg">{followers}</strong> Followers</span>
              <span><strong className="text-white text-sm md:text-lg">{following}</strong> Following</span>
              <span><strong className="text-white text-sm md:text-lg">{userPostsCount}</strong> Posts</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-8 border-b border-white/10 w-full">
        <div className="flex flex-wrap gap-2 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-[#38bdf8] text-white' 
                  : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-white/10 text-white/50'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}
