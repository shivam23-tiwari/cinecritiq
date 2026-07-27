import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, getDocs, doc, getDoc, setDoc, serverTimestamp, orderBy, deleteDoc, where } from '../lib/firestore-wrapper';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import MovieCard from '../components/MovieCard';
import { useNavigate, Link } from 'react-router-dom';
import { Settings, Save, X, ImageIcon, Link as LinkIcon, Heart, Clock, Eye, Star, BookOpen, Crown, CheckCircle2, CreditCard, Smartphone, ShieldCheck, Plus, Search as SearchIcon, Upload, Instagram, Activity, Grid, Users } from 'lucide-react';
import { getImageUrl, fetchFromTmdb } from '../lib/tmdb';
import PostsFeed from '../components/PostsFeed';

import PremiumModal from '../components/PremiumModal';

const AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=E50914",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aneka&backgroundColor=4338ca",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Mimi&backgroundColor=047857",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Jack&backgroundColor=be185d",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Jude&backgroundColor=0f766e",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Leo&backgroundColor=b45309"
];

type TabType = 'films' | 'diary' | 'reviews' | 'watchlist' | 'lists' | 'top4';

export default function Profile() {
  const { user, userData, loading, customPosters, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<any>('top4');
  
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [watched, setWatched] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [diary, setDiary] = useState<any[]>([]);
  const [userGlobalReviews, setUserGlobalReviews] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);

  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user && !fetching) {
                                                    }
  }, [favorites, watchlist, watched, ratings, diary, lists, userGlobalReviews, userPosts, user, fetching]);
  

  
  const [isEditing, setIsEditing] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [profileData, setProfileData] = useState({
      displayName: '',
      email: '',
      photoURL: '',
      mobileNumber: '',
      instagramUsername: '',
      isPremium: false,
      mcqWinnerStarUntil: null as any
  });

  useEffect(() => {
    if (user && profileData.displayName) {
          }
  }, [profileData, user]);
  const [showCustomPhotoInput, setShowCustomPhotoInput] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Diary feature states
  const [showAddDiaryModal, setShowAddDiaryModal] = useState(false);
  const [diarySearchText, setDiarySearchText] = useState('');
  const [diarySearchResults, setDiarySearchResults] = useState<any[]>([]);
  const [selectedMovieForDiary, setSelectedMovieForDiary] = useState<any | null>(null);
  const [newDiaryEntryText, setNewDiaryEntryText] = useState('');
  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [isSearchingDiary, setIsSearchingDiary] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'title' | 'rating'>('newest');
  const [filterDecade, setFilterDecade] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterRating, setFilterRating] = useState('');


  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => { console.log('useEffect Profile', new Error().stack.split('\n')[1]);
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userData && !hasInitialized) {
      setProfileData({
        displayName: userData.displayName || user?.displayName || '',
        email: userData.email || user?.email || '',
        photoURL: userData.photoURL || user?.photoURL || '',
        mobileNumber: userData.mobileNumber || '',
        instagramUsername: userData.instagramUsername || '',
        isPremium: userData.isPremium || false,
        mcqWinnerStarUntil: userData.mcqWinnerStarUntil || null
      });
      setHasInitialized(true);
    } else if (!userData && user && !hasInitialized) {
      setProfileData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        photoURL: user.photoURL || ''
      }));
      setHasInitialized(true);
    }
  }, [userData, user, hasInitialized]);

  useEffect(() => { console.log('useEffect Profile', new Error().stack.split('\n')[1]);
    if (user && hasInitialized) {
      // Fetch extended profile data (followers/stats/self-heal)
      const fetchExtendedProfile = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          let currentDisplayName = user.displayName || '';
          let currentPhotoURL = user.photoURL || '';
          
          if (userSnap.exists()) {
            const data: any = userSnap.data();
            currentDisplayName = data.displayName || currentDisplayName;
            currentPhotoURL = data.photoURL || currentPhotoURL;
            
            setProfileData(prev => ({
              ...prev,
              displayName: currentDisplayName,
              photoURL: currentPhotoURL,
              mobileNumber: data.mobileNumber || '',
              instagramUsername: data.instagramUsername || '',
              isPremium: data.isPremium || false,
              mcqWinnerStarUntil: data.mcqWinnerStarUntil || null
            }));
          }

          // Self-heal: check if posts have wrong name
          const { updateDoc } = await import('../lib/firestore-wrapper');
          const postsQ = query(collection(db, 'posts'), where('userId', '==', user.uid));
          const postsSnap = await getDocs(postsQ);
          let needsUpdate = false;
          const updates: any[] = [];
          
          postsSnap.forEach(postDoc => {
             const data: any = postDoc.data();
             if (data.userName !== currentDisplayName || data.userPhoto !== currentPhotoURL) {
                needsUpdate = true;
                updates.push(updateDoc(doc(db, 'posts', postDoc.id), {
                   userName: currentDisplayName,
                   userPhoto: currentPhotoURL
                }));
             }
          });
          
          const reviewsQ = query(collection(db, 'reviews'), where('userId', '==', user.uid));
          const reviewsSnap = await getDocs(reviewsQ);
          reviewsSnap.forEach(reviewDoc => {
             const data: any = reviewDoc.data();
             if (data.userName !== currentDisplayName || data.userPhoto !== currentPhotoURL) {
                needsUpdate = true;
                updates.push(updateDoc(doc(db, 'reviews', reviewDoc.id), {
                   userName: currentDisplayName,
                   userPhoto: currentPhotoURL
                }));
             }
          });
          
          if (needsUpdate && updates.length > 0) {
             await Promise.all(updates);
             console.log("Self-healed user posts and reviews names.");
          }

          const followersQuery = query(collection(db, `users/${user.uid}/followers`));
          const followingQuery = query(collection(db, `users/${user.uid}/following`));
          
          const [followersSnap, followingSnap] = await Promise.all([
            getDocs(followersQuery).catch(() => ({ size: 0 })),
            getDocs(followingQuery).catch(() => ({ size: 0 }))
          ]);
          
          setFollowersCount(followersSnap.size);
          setFollowingCount(followingSnap.size);
        } catch (e) {
          if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) {
            console.error("Error fetching extended profile:", e);
          } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
        }
      };

      fetchExtendedProfile();

      


  const fetchUserPosts = async () => {
         try {
            const postsQ = query(collection(db, 'posts'), where('userId', '==', user.uid));
            const postsSnap = await getDocs(postsQ);
            const postsList = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), feedType: 'post' }));
            
            const logsQ = query(collection(db, 'logs'), where('userId', '==', user.uid));
            const logsSnap = await getDocs(logsQ);
            const logsList = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), feedType: 'log' }));
            
            const combined = [...postsList, ...logsList];
            
            // Sort by createdAt desc
            combined.sort((a, b) => ((b as any).createdAt?.toMillis() || 0) - ((a as any).createdAt?.toMillis() || 0));
            setUserPosts(combined);
         } catch (e) {
            if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) {
              console.error("Failed to fetch posts/logs", e);
            } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
         }
      };
      fetchUserPosts();

      const fetchGlobalReviews = async () => {
         try {
            const reviewsQ = query(collection(db, 'reviews'), where('userId', '==', user.uid));
            const snap = await getDocs(reviewsQ);
            const reviewsList = await Promise.all(snap.docs.map(async doc => {
               const data = doc.data();
               let title = 'Unknown Movie';
               let poster_path = null;
               try {
                 const tmdbData = await fetchFromTmdb(`/movie/${data.movieId}`);
                 if (tmdbData && (tmdbData.title || tmdbData.name)) {
                   title = tmdbData.title || tmdbData.name;
                   poster_path = tmdbData.poster_path;
                 } else {
                   const tmdbSeries = await fetchFromTmdb(`/tv/${data.movieId}`);
                   if (tmdbSeries && (tmdbSeries.name || tmdbSeries.title)) {
                     title = tmdbSeries.title || tmdbSeries.name;
                     poster_path = tmdbSeries.poster_path;
                   }
                 }
               } catch(e) {}
               return { id: doc.id, title, poster_path, ...data };
            }));
            setUserGlobalReviews(reviewsList);
         } catch (e) {
            console.error("Failed to fetch global reviews", e);
         }
      };
      fetchGlobalReviews();
      
      const fetchActions = async () => {
         try {
            const q = query(collection(db, `users/${user.uid}/movieActions`));
            let snap = null;
            try {
               snap = await getDocs(q);
            } catch (e) {
               handleFirestoreError(e, OperationType.LIST, `users/${user.uid}/movieActions`);
            }
            
            // Also fetch from legacy collections just in case
            const legacyCollections = ['favorites', 'watchlist', 'watched', 'ratings', 'diary'];
            const legacyPromises = legacyCollections.map(colName => 
               getDocs(query(collection(db, `users/${user.uid}/${colName}`))).catch(() => null)
            );
            const legacySnaps = await Promise.all(legacyPromises);
            
            const favsMap = new Map();
            const watchMap = new Map();
            const seenMap = new Map();
            const rateMap = new Map();
            const diaryMap = new Map();
            
            const processDocs = (docs: any[], defaultType?: string) => {
               docs.forEach((doc) => {
                  const data = doc.data();
                  let movieObj = {
                     id: data.movieId || data.id || parseInt(doc.id) || doc.id.replace(defaultType + '_', ''),
                     title: data.movieData?.title || data.movieData?.name || data.title || data.name,
                     poster_path: data.movieData?.poster_path || data.poster_path,
                     vote_average: data.movieData?.vote_average || data.vote_average,
                     release_date: data.movieData?.release_date || data.movieData?.first_air_date || data.release_date || data.first_air_date,
                     media_type: data.mediaType || data.movieData?.media_type || data.media_type || "movie"
                  };
                  let type = data.actionType || defaultType;
                  if (!type) {
                     if (doc.id.startsWith('watched_')) type = 'watched';
                     else if (doc.id.startsWith('watchlist_')) type = 'watchlist';
                     else if (doc.id.startsWith('rated_') || doc.id.startsWith('rating_')) type = 'rated';
                     else if (doc.id.startsWith('diary_')) type = 'diary';
                     else type = 'favorite';
                  }
                  
                  if (type === 'favorite') favsMap.set(String(movieObj.id), movieObj);
                  if (type === 'watchlist') watchMap.set(String(movieObj.id), movieObj);
                  if (type === 'watched') seenMap.set(String(movieObj.id), movieObj);
                  if (type === 'rated') rateMap.set(String(movieObj.id), { ...movieObj, rating: data.rating });
                  if (type === 'diary') diaryMap.set(String(movieObj.id), { ...movieObj, text: data.text, createdAt: data.createdAt?.toDate() });
               });
            };
            
            if (snap && snap.docs) {
               processDocs(snap.docs);
            }
            
            legacySnaps.forEach((lSnap, idx) => {
               if (lSnap && lSnap.docs) {
                  processDocs(lSnap.docs, legacyCollections[idx] === 'favorites' ? 'favorite' : legacyCollections[idx]);
               }
            });
            
            const filterUntitled = (m: any) => {
               const t = String(m.title || m.name || '').toLowerCase();
               return t === '' || !t.includes('untitled');
            };
            
            setFavorites(Array.from(favsMap.values()).filter(filterUntitled));
            setWatchlist(Array.from(watchMap.values()).filter(filterUntitled));
            setWatched(Array.from(seenMap.values()).filter(filterUntitled));
            setRatings(Array.from(rateMap.values()).filter(filterUntitled));
                        setDiary(Array.from(diaryMap.values()));
            
            // Sync stats to user doc
            if (user && user.uid) {
              try {
                  const finalWatched = Array.from(seenMap.values()).filter(filterUntitled);
                  const finalRatings = Array.from(rateMap.values()).filter(filterUntitled);
                  
                  const allMoviesMap = new Map();
                  const addToAll = (m: any) => {
                     if (!allMoviesMap.has(String(m.id))) {
                        allMoviesMap.set(String(m.id), { ...m, rating: 0, isFav: false });
                     }
                  };
                  Array.from(seenMap.values()).forEach(addToAll);
                  Array.from(rateMap.values()).forEach(addToAll);
                  Array.from(favsMap.values()).forEach(addToAll);
                  Array.from(diaryMap.values()).forEach(addToAll);
                  
                  Array.from(favsMap.values()).forEach((f: any) => {
                     if (allMoviesMap.has(String(f.id))) {
                        allMoviesMap.get(String(f.id)).isFav = true;
                     }
                  });
                  
                  Array.from(rateMap.values()).forEach((r: any) => {
                     if (allMoviesMap.has(String(r.id))) {
                        allMoviesMap.get(String(r.id)).rating = r.rating || 0;
                     }
                  });
                  
                  const topFavorites = Array.from(allMoviesMap.values()).sort((a: any, b: any) => {
                     if ((b.rating || 0) !== (a.rating || 0)) {
                        return (b.rating || 0) - (a.rating || 0);
                     }
                     if (b.isFav !== a.isFav) {
                        return b.isFav ? 1 : -1;
                     }
                     return (b.createdAt || 0) - (a.createdAt || 0);
                  }).slice(0, 4).map((m: any) => ({
                     id: m.id,
                     posterPath: customPosters?.[m.id] || m.poster_path || m.posterPath || null
                  }));

                  await setDoc(doc(db, 'users', user.uid), {
                      stats: { watched: finalWatched.length, rated: finalRatings.length },
                      topFavorites
                  }, { merge: true });
              } catch (e) { console.error('Failed to sync user stats', e); }
            }
         } catch (error) {
            if (!String(error).includes('Quota limit exceeded') && !(error?.message || "").includes('Quota limit exceeded')) {
               console.error(error);
            } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
         } finally {
            setFetching(false);
         }
      };
      
      fetchActions();
    }
  }, [user, hasInitialized]);

  const handleSearchMovieForDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diarySearchText.trim()) return;
    setIsSearchingDiary(true);
    try {
        const data = await fetchFromTmdb('/search/multi', { query: diarySearchText, include_adult: 'false' });
        setDiarySearchResults((data.results || []).filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv'));
    } catch (error) {
        console.error(error);
    } finally {
        setIsSearchingDiary(false);
    }
  };

  const handleSaveNewDiaryEntry = async () => {
    if (!selectedMovieForDiary || !newDiaryEntryText.trim() || !user) return;
    setIsSavingDiary(true);
    try {
        const actionId = `diary_${selectedMovieForDiary.id}`;
        const actionRef = doc(db, 'users', user.uid, 'movieActions', actionId);
        
        await setDoc(actionRef, {
            movieId: selectedMovieForDiary.id,
            actionType: 'diary',
            text: newDiaryEntryText,
            createdAt: serverTimestamp(),
            mediaType: selectedMovieForDiary.media_type || 'movie',
            movieData: {
                title: selectedMovieForDiary.title || selectedMovieForDiary.name,
                poster_path: selectedMovieForDiary.poster_path,
                release_date: selectedMovieForDiary.release_date || selectedMovieForDiary.first_air_date
            }
        });
        
        setDiary(prev => {
            const entryExists = prev.some(item => String(item.id) === String(selectedMovieForDiary.id));
            const newEntry = {
                id: String(selectedMovieForDiary.id),
                title: selectedMovieForDiary.title || selectedMovieForDiary.name,
                poster_path: selectedMovieForDiary.poster_path,
                text: newDiaryEntryText,
                createdAt: new Date()
            };
            if (entryExists) {
               return prev.map(item => String(item.id) === String(selectedMovieForDiary.id) ? newEntry : item);
            }
            return [newEntry, ...prev];
        });
        
        setShowAddDiaryModal(false);
        setSelectedMovieForDiary(null);
        setNewDiaryEntryText("");
        setDiarySearchText("");
        setDiarySearchResults([]);
    } catch (error) {
        console.error(error);
    } finally {
        setIsSavingDiary(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 300;
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setProfileData(prev => ({ ...prev, photoURL: dataUrl }));
          setShowCustomPhotoInput(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!profileData.displayName.trim()) {
      alert("Display name cannot be empty.");
      return;
    }
    
    setSavingStatus('saving');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = {
        uid: user.uid,
        displayName: profileData.displayName || '',
        photoURL: profileData.photoURL || '', 
        mobileNumber: profileData.mobileNumber || '',
        instagramUsername: profileData.instagramUsername || '',
        updatedAt: serverTimestamp()
      };
                  
      await setDoc(userRef, updateData, { merge: true });

      let safePhotoURL = profileData.photoURL;
      if (safePhotoURL && safePhotoURL.startsWith('data:image') && safePhotoURL.length > 4000) {
        // Firebase Auth fails on long data URLs
        safePhotoURL = user.photoURL || ''; 
       }
            
      try {
        await updateProfile(auth.currentUser!, {
          displayName: profileData.displayName,
          photoURL: safePhotoURL
        });
      } catch (authErr) {
        console.warn("Could not update auth profile, continuing to save to Firestore", authErr);
      }
      
      // Update posts and reviews with new name
      try {
          const { updateDoc, query, where, getDocs, collection } = await import('../lib/firestore-wrapper');
          
          const postsQ = query(collection(db, 'posts'), where('userId', '==', user.uid));
          const postsSnap = await getDocs(postsQ);
          const updates = [];
          
          postsSnap.forEach(postDoc => {
             updates.push(updateDoc(doc(db, 'posts', postDoc.id), {
                userName: profileData.displayName || '',
                userPhoto: profileData.photoURL || ''
             }));
          });
          
          const reviewsQ = query(collection(db, 'reviews'), where('userId', '==', user.uid));
          const reviewsSnap = await getDocs(reviewsQ);
          reviewsSnap.forEach(reviewDoc => {
             updates.push(updateDoc(doc(db, 'reviews', reviewDoc.id), {
                userName: profileData.displayName || '',
                userPhoto: profileData.photoURL || ''
             }));
          });
          
          if (updates.length > 0) {
             await Promise.all(updates);
          }
      } catch (e) {
          console.error("Failed to update posts/reviews", e);
      }
      
      setSavingStatus('success');

      setTimeout(() => {
        setSavingStatus('idle');
        setIsEditing(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setSavingStatus('error');
      alert(`Failed to save profile: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) return null;

  const top10 = [...ratings].sort((a, b) => b.rating - a.rating).slice(0, 10);

  const uniqueFilmsCount = () => {
    const s = new Set();
    watched.forEach(m => s.add(String(m.id)));
    favorites.forEach(m => s.add(String(m.id)));
    ratings.forEach(m => s.add(String(m.id)));
    diary.forEach(m => s.add(String(m.id)));
    return s.size;
  };

  const tabs = [
    { id: 'top4', label: 'Favorites 4', icon: Star, count: null },
    { id: 'watched', label: 'Films', icon: Eye, count: watched.length },
    { id: 'ratings', label: 'Ratings', icon: Star, count: ratings.length },
    { id: 'films', label: 'Liked Films', icon: Heart, count: favorites.length },
    { id: 'diary', label: 'Diary', icon: BookOpen, count: diary.length },
    { id: 'reviews', label: 'Reviews', icon: Star, count: userGlobalReviews.length },
    { id: 'posts', label: 'Posts', icon: BookOpen, count: userPosts.length },
    { id: 'watchlist', label: 'Watchlist', icon: Clock, count: watchlist.length },
    { id: 'lists', label: 'Lists', icon: BookOpen, count: lists.length }
  ];

  const renderActiveTabContent = () => {
    if (fetching) {
    



  return (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38bdf8]"></div>
        </div>
      );
    }

    const getSortedList = (list: any[]) => {
      return [...list].sort((a, b) => {
        if (sortOption === 'newest') {
          const timeA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const timeB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
        } else if (sortOption === 'oldest') {
          const timeA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const timeB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
        } else if (sortOption === 'title') {
          return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        } else if (sortOption === 'rating') {
          return (b.vote_average || 0) - (a.vote_average || 0);
        }
        return 0;
      });
    };

    const getFilteredList = (list: any[]) => {
       let filtered = [...list];
       if (filterDecade) {
          filtered = filtered.filter(item => {
             const year = new Date(item.release_date || 0).getFullYear();
             const startYear = parseInt(filterDecade.substring(0, 4));
             return year >= startYear && year < startYear + 10;
          });
       }
       if (filterRating) {
          filtered = filtered.filter(item => {
             const rt = item.rating || item.vote_average || 0;
             return Math.round(rt) === parseInt(filterRating);
          });
       }
       return getSortedList(filtered);
    };

    const FilterControls = () => (
      <div className="flex flex-wrap items-center gap-2">
        <select value={filterDecade} onChange={e => setFilterDecade(e.target.value)} className="bg-transparent text-white/70 text-xs md:text-sm py-1 px-2 focus:outline-none hover:text-white cursor-pointer">
          <option value="" className="bg-[#141414]">Decade</option>
          <option value="2020s" className="bg-[#141414]">2020s</option>
          <option value="2010s" className="bg-[#141414]">2010s</option>
          <option value="2000s" className="bg-[#141414]">2000s</option>
          <option value="1990s" className="bg-[#141414]">1990s</option>
          <option value="1980s" className="bg-[#141414]">1980s</option>
          <option value="1970s" className="bg-[#141414]">1970s</option>
          <option value="1960s" className="bg-[#141414]">1960s</option>
          <option value="1950s" className="bg-[#141414]">1950s</option>
        </select>
        <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)} className="bg-transparent text-white/70 text-xs md:text-sm py-1 px-2 focus:outline-none hover:text-white cursor-pointer">
          <option value="" className="bg-[#141414]">Genre</option>
          <option value="action" className="bg-[#141414]">Action</option>
          <option value="adventure" className="bg-[#141414]">Adventure</option>
          <option value="animation" className="bg-[#141414]">Animation</option>
          <option value="comedy" className="bg-[#141414]">Comedy</option>
          <option value="crime" className="bg-[#141414]">Crime</option>
          <option value="documentary" className="bg-[#141414]">Documentary</option>
          <option value="drama" className="bg-[#141414]">Drama</option>
          <option value="family" className="bg-[#141414]">Family</option>
          <option value="fantasy" className="bg-[#141414]">Fantasy</option>
          <option value="history" className="bg-[#141414]">History</option>
          <option value="horror" className="bg-[#141414]">Horror</option>
          <option value="music" className="bg-[#141414]">Music</option>
          <option value="mystery" className="bg-[#141414]">Mystery</option>
          <option value="romance" className="bg-[#141414]">Romance</option>
          <option value="science fiction" className="bg-[#141414]">Science Fiction</option>
          <option value="thriller" className="bg-[#141414]">Thriller</option>
          <option value="war" className="bg-[#141414]">War</option>
          <option value="western" className="bg-[#141414]">Western</option>
        </select>
        <select value={filterService} onChange={e => setFilterService(e.target.value)} className="bg-transparent text-white/70 text-xs md:text-sm py-1 px-2 focus:outline-none hover:text-white cursor-pointer">
          <option value="" className="bg-[#141414]">Service</option>
          <option value="netflix" className="bg-[#141414]">Netflix</option>
          <option value="amazon" className="bg-[#141414]">Amazon Prime</option>
          <option value="hulu" className="bg-[#141414]">Hulu</option>
        </select>
        <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="bg-transparent text-white/70 text-xs md:text-sm py-1 px-2 focus:outline-none hover:text-white cursor-pointer">
          <option value="" className="bg-[#141414]">Rating</option>
          <option value="10" className="bg-[#141414]">10 ★</option>
          <option value="9" className="bg-[#141414]">9 ★</option>
          <option value="8" className="bg-[#141414]">8 ★</option>
          <option value="7" className="bg-[#141414]">7 ★</option>
          <option value="6" className="bg-[#141414]">6 ★</option>
          <option value="5" className="bg-[#141414]">5 ★</option>
          <option value="4" className="bg-[#141414]">4 ★</option>
          <option value="3" className="bg-[#141414]">3 ★</option>
          <option value="2" className="bg-[#141414]">2 ★</option>
          <option value="1" className="bg-[#141414]">1 ★</option>
        </select>
      </div>
    );

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
      const top4Movies = Array.from(allMoviesMap.values()).sort((a: any, b: any) => {
        if ((b.rating || 0) !== (a.rating || 0)) {
            return (b.rating || 0) - (a.rating || 0);
        }
        if (b.isFav !== a.isFav) {
            return b.isFav ? 1 : -1;
        }
        return (b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0)) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0));
      }).slice(0, 4);

      const slots = [0, 1, 2, 3];
      return (
        <div className="space-y-12">
          {/* Favorites 4 Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Favorites 4</h2>
              {top4Movies.length >= 1 && (
                <Link
                  to="/community?same=true"
                  className="bg-[#2c3440] hover:bg-white/10 text-[#D4AF37] hover:text-[#FACC15] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:border-[#D4AF37] text-sm font-bold px-4 py-2 rounded-full border border-white/10 transition-all flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Similar
                </Link>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 py-4">
              {slots.map(index => {
                const movie = top4Movies[index];
                if (movie) {
                  return (
                    <div key={`top4-${index}`} className="relative group rounded-xl overflow-hidden aspect-[2/3] border border-white/10 hover:border-[#38bdf8] transition-colors w-full">
                      <Link to={`/movie/${movie.id}`}>
                        <img referrerPolicy="no-referrer" 
                          src={customPosters?.[movie.id] || getImageUrl(movie.poster_path, 'w500')} 
                          alt={movie.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                          <div className="flex gap-1 mb-2">
                            {[1,2,3,4,5].map(star => (
                               <Star key={star} className={`w-3 h-3 md:w-4 md:h-4 ${star <= (movie.rating || 0) ? 'text-[#38bdf8] fill-[#38bdf8]' : 'text-white/20'}`} />
                            ))}
                          </div>
                          <span className="text-white font-bold text-[10px] md:text-sm text-center px-2">{movie.title}</span>
                        </div>
                      </Link>
                    </div>
                  );
                } else {
                  return (
                    <div key={`empty-${index}`} className="flex flex-col items-center justify-center rounded-xl overflow-hidden aspect-[2/3] border border-dashed border-white/20 bg-white/5 text-white/30 w-full cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setActiveTab('ratings')}>
                      <Star className="w-6 h-6 md:w-8 md:h-8 mb-2 opacity-20" />
                      <span className="text-[10px] md:text-sm font-medium">Add a Favorite</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Recent Activity Section */}
          {watched.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <button onClick={() => setActiveTab('watched')} className="text-[#38bdf8] text-xs md:text-sm font-bold hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 py-4">
                  {watched.map((movie, idx) => (
                    <div key={`recent-${movie.id}-${idx}`}>
                      <MovieCard movie={{ ...movie, poster_path: customPosters?.[movie.id] || movie.poster_path }} userRating={ratings.find((r: any) => r.id === movie.id)?.rating} hideGlobalRating={true} />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (activeTab === 'lists') {
      return <EmptyState message={`You don't have any lists yet. Create a list to organize your favorite films.`} />
    }

    
    if (activeTab === 'posts') {
      return (
        <div className="max-w-3xl mx-auto">
           <PostsFeed userId={user.uid} />
        </div>
      );
    }
    
    

    if (activeTab === 'reviews') {
       const reviewsToShow = userGlobalReviews;
       if (reviewsToShow.length === 0) {
          return <EmptyState message="You haven't reviewed any films yet." />;
       }
       return (
         <div className="space-y-6">
           <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
             <FilterControls />
           </div>
           {reviewsToShow.map((item, _i) => {
              // If it's a global review, it has .movieId and .content
              // If it's a local rating+diary, it has .id and the text is in diary
              const id = item.movieId || item.id;
              
              // Find movie details from ratings or watched lists if not on item
              const movieObj = ratings.find(r => String(r.id) === String(id)) || 
                               watched.find(w => String(w.id) === String(id)) || 
                               favorites.find(f => String(f.id) === String(id)) || item;
                               
              const title = movieObj?.title || movieObj?.name || 'Unknown Movie';
              const poster_path = movieObj?.poster_path;
              const reviewText = item.content || diary.find(d => String(d.id) === String(id))?.text;
              const rating = item.rating || movieObj?.rating;
              const likeCount = item.likesCount;
              
              return (
              <div key={`${item.id}-${_i}`} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                <Link to={`/movie/${id}`} className="shrink-0 w-32 rounded-lg overflow-hidden border border-white/10 group">
                  <img referrerPolicy="no-referrer" src={customPosters?.[id] || getImageUrl(poster_path, 'w500')} alt={title} className="w-full h-auto group-hover:scale-105 transition-transform" />
                </Link>
                <div className="flex-1 flex flex-col">
                  <Link to={`/movie/${id}`}>
                    <h3 className="text-xl font-bold text-white hover:text-[#38bdf8] transition-colors">{title}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= (rating || 0) ? 'text-[#38bdf8] fill-[#38bdf8]' : 'text-white/20'}`} />
                      ))}
                    </div>
                  </div>
                  {reviewText && <p className="text-white/80 whitespace-pre-wrap leading-relaxed flex-1">{reviewText}</p>}
                  
                  {typeof likeCount === 'number' && (
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/10 text-xs md:text-sm text-white/50">
                       <button className="flex items-center gap-1.5 text-white/40 cursor-default">
                          <Heart className="w-4 h-4 fill-current text-white/40" /> {likeCount} Likes
                       </button>
                    </div>
                  )}
                </div>
              </div>
           )})}
         </div>
       );
    }

    if (activeTab === 'diary') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">My Diary</h3>
              <p className="text-xs md:text-sm text-gray-400">Add movies you've watched and write your personal thoughts.</p>
            </div>
            <button 
              onClick={() => setShowAddDiaryModal(true)}
              className="bg-[#2c3440] hover:bg-white/10 text-[#D4AF37] hover:text-[#FACC15] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:border-[#D4AF37] border border-white/10 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-5 h-5" /> Add to Diary
            </button>
          </div>
          
          {diary.length === 0 ? (
            <EmptyState message="No diary entries yet. Add a movie to your diary to get started." />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                <FilterControls />
              </div>
              {getFilteredList(diary).map((entry, _i) => (
                <div key={`${entry.id}-${_i}`} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                  <Link to={`/movie/${entry.id}`} className="shrink-0 w-16 md:w-20 rounded-lg overflow-hidden border border-white/10 group">
                    <img referrerPolicy="no-referrer" src={customPosters?.[entry.id] || getImageUrl(entry.poster_path, 'w500')} alt={entry.title} className="w-full h-auto group-hover:scale-105 transition-transform" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/movie/${entry.id}`}>
                      <h3 className="text-xl font-bold text-white hover:text-[#38bdf8] transition-colors">{entry.title}</h3>
                    </Link>
                    <p className="text-xs text-white/40 mt-1 mb-4">{entry.createdAt ? entry.createdAt.toLocaleDateString() : ''}</p>
                    <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    let activeList: any[] = [];
    if (activeTab === 'films') {
       activeList = favorites;
    } else if (activeTab === 'watchlist') {
       activeList = watchlist;
    } else if (activeTab === 'ratings') {
       activeList = ratings;
       
    } else if (activeTab === 'watched') {
       activeList = watched;
    }

    if (activeList.length === 0) {
      return <EmptyState message={activeTab === 'ratings' ? "You haven't rated any films yet." : "No movies found in this list."} />;
    }

    const sortedList = getFilteredList(activeList);

    return (
      <div>
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-white/50">
            <span>{activeList.length} films</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterControls />
            <span className="text-white/20">|</span>
            <span className="text-xs md:text-sm text-white/50 mr-2">Sort by</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-white text-xs md:text-sm rounded-lg py-1.5 px-3 focus:outline-none focus:border-[#38bdf8] appearance-none cursor-pointer"
            >
              <option value="newest" className="bg-[#141414]">Release Date (Newest)</option>
              <option value="oldest" className="bg-[#141414]">Release Date (Oldest)</option>
              <option value="title" className="bg-[#141414]">Film Name</option>
              <option value="rating" className="bg-[#141414]">Film Popularity</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 py-4">
          {sortedList.map((movie, idx) => (
            <div key={`${movie.id}-${idx}`}>
                      <MovieCard movie={{ ...movie, poster_path: customPosters?.[movie.id] || movie.poster_path }} userRating={ratings.find((r: any) => r.id === movie.id)?.rating} hideGlobalRating={true} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-20 bg-white/5 rounded-lg border border-white/10 text-white/40">
      <p>{message}</p>
    </div>
  );


  const handleClearPosters = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to reset all custom posters? This will revert them to their original TMDB images.")) {
       try {
          const q = query(collection(db, 'users', user.uid, 'movieActions'), where('actionType', '==', 'customPoster'));
          const actionsSnap = await getDocs(q);
          actionsSnap.forEach(async (d) => await deleteDoc(d.ref));
          alert("Custom posters have been reset successfully! Please refresh the page.");
       } catch (e) {
          console.error(e);
          alert("Failed to reset posters.");
       }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pt-24 pb-12 min-h-screen">
      
      {/* Add Diary Modal */}
      {showAddDiaryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141414] border border-white/20 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add to Diary</h2>
              <button onClick={() => {
                  setShowAddDiaryModal(false);
                  setSelectedMovieForDiary(null);
                  setNewDiaryEntryText("");
                  setDiarySearchText("");
                  setDiarySearchResults([]);
              }} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {!selectedMovieForDiary ? (
                <div>
                    <form onSubmit={handleSearchMovieForDiary} className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search for a movie or series..."
                            value={diarySearchText}
                            onChange={(e) => setDiarySearchText(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-24 text-white focus:border-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                        />
                        <SearchIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                        <button type="submit" className="absolute right-2 top-2 bg-[#38bdf8] text-white px-4 py-1 rounded-lg text-xs md:text-sm font-bold hover:bg-[#b8070f] transition-colors">Search</button>
                    </form>
                    
                    {isSearchingDiary ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38bdf8]"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {diarySearchResults.length === 0 && diarySearchText ? (
                                <div className="text-center text-white/50 py-10">Press Search to find movies</div>
                            ) : diarySearchResults.map((item, _i) => (
                                <div key={`${item.id}-${_i}`} onClick={() => setSelectedMovieForDiary(item)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition-all">
                                    <img referrerPolicy="no-referrer" src={customPosters?.[item.id] || getImageUrl(item.poster_path, 'w200')} alt={item.title || item.name} className="w-12 h-16 object-cover rounded-md bg-black" />
                                    <div>
                                        <div className="font-bold text-white">{item.title || item.name}</div>
                                        <div className="text-xs text-gray-400">
                                            {item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date).getFullYear() : ''} 
                                            {item.media_type === 'tv' ? ' • TV Series' : ' • Movie'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <img referrerPolicy="no-referrer" src={customPosters?.[selectedMovieForDiary.id] || getImageUrl(selectedMovieForDiary.poster_path, 'w200')} alt={selectedMovieForDiary.title || selectedMovieForDiary.name} className="w-16 h-24 object-cover rounded-md" />
                        <div>
                            <div className="font-bold text-lg text-white">{selectedMovieForDiary.title || selectedMovieForDiary.name}</div>
                            <div className="text-xs md:text-sm text-gray-400">
                                {selectedMovieForDiary.release_date || selectedMovieForDiary.first_air_date ? new Date(selectedMovieForDiary.release_date || selectedMovieForDiary.first_air_date).getFullYear() : ''}
                            </div>
                            <button onClick={() => setSelectedMovieForDiary(null)} className="text-[#38bdf8] text-xs font-medium mt-2 hover:underline">Change Selection</button>
                        </div>
                    </div>
                    
                    <textarea
                        value={newDiaryEntryText}
                        onChange={(e) => setNewDiaryEntryText(e.target.value)}
                        placeholder="Write your thoughts, review, or memories about this..."
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white resize-none focus:border-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8] mb-6"
                    />
                    
                    <button
                        onClick={handleSaveNewDiaryEntry}
                        disabled={!newDiaryEntryText.trim() || isSavingDiary}
                        className="w-full bg-[#38bdf8] text-white font-bold py-3 rounded-xl hover:bg-[#b8070f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSavingDiary ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSavingDiary ? 'Saving...' : 'Save Diary Entry'}
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Upgrade Modal */}
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => setProfileData(prev => ({ ...prev, isPremium: true }))}
      />
      
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-12 p-4 md:p-8 bg-black/40 rounded-xl border border-white/5 relative shadow-xl">
           
           <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-red-600 shrink-0 shadow-lg bg-neutral-900">
              {profileData.photoURL ? <img referrerPolicy="no-referrer" src={profileData.photoURL} alt={profileData.displayName || 'User'} className="w-full h-full object-cover"/> : <img referrerPolicy="no-referrer" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.displayName || 'user'}`} alt="User" className="w-full h-full object-cover" />}
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
                  {(userData?.isPremium || profileData.isPremium) && (
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
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded font-bold uppercase tracking-wider" >
                    GOAT
                  </span>
                )}
                {!(userData?.isPremium || profileData.isPremium) && (
                  <button 
                    onClick={() => navigate('/premium')}
                    className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B59410] text-black text-xs font-bold rounded-full uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-1 shrink-0 whitespace-nowrap"
                  >
                    <Crown className="w-3 h-3 shrink-0" /> Go to Premium
                  </button>
                )}
                </div>
                
                <div className="absolute top-4 right-4 sm:static sm:top-auto sm:right-auto flex items-center gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="sm:hidden p-2 bg-[#2c3440] hover:bg-white/10 text-[#D4AF37] hover:text-[#FACC15] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:border-[#D4AF37] transition-all rounded-full border border-white/10 shadow-lg"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="hidden sm:flex items-center justify-center gap-2 px-4 py-2 text-sm bg-[#2c3440] hover:bg-white/10 text-[#D4AF37] hover:text-[#FACC15] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:border-[#D4AF37] font-bold rounded-lg transition-all border border-white/10"
                    >
                        <Settings className="w-4 h-4" /> Edit Profile
                    </button>
                </div>
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
                    <span>@{profileData.instagramUsername?.replace('@', '')}</span>
                  </a>
                )}
                
                <div className="flex items-center justify-start gap-2 md:gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-xs md:text-sm">{followersCount}</span>
                    <span className="text-white/50 text-xs md:text-sm">Followers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-xs md:text-sm">{followingCount}</span>
                    <span className="text-white/50 text-xs md:text-sm">Following</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-xs md:text-sm">{userPosts.length}</span>
                    <span className="text-white/50 text-xs md:text-sm">Posts</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-start gap-2 md:gap-4 mt-2">
                   <div className="flex items-center gap-1.5">
                      <span className="text-white/50 text-xs md:text-sm">Status:</span>
                      <span className={`text-xs md:text-sm font-bold ${(userData?.isPremium || profileData.isPremium) ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
                         {(userData?.isPremium || profileData.isPremium) ? 'Pro State' : 'Normal State'}
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
           </div>
        </div>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141414] border border-white/20 rounded-2xl w-full max-w-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
            <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase">Name</label>
                <input 
                  type="text" 
                  value={profileData.displayName}
                  onChange={e => setProfileData({...profileData, displayName: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase">Instagram Username</label>
                <input 
                  type="text" 
                  value={profileData.instagramUsername}
                  onChange={e => setProfileData({...profileData, instagramUsername: e.target.value})}
                  placeholder="e.g. username"
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs text-white/50 uppercase">Profile Picture</label>
              
              <div className="flex flex-wrap gap-4 items-center">
                {AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setProfileData({...profileData, photoURL: avatar});
                      setShowCustomPhotoInput(false);
                    }}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${profileData.photoURL === avatar && !showCustomPhotoInput ? 'border-[#38bdf8] scale-110 shadow-lg shadow-[#38bdf8]/20' : 'border-transparent hover:border-white/30 hover:scale-105'}`}
                  >
                    <img referrerPolicy="no-referrer" src={avatar} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setShowCustomPhotoInput(true)}
                  className={`w-16 h-16 rounded bg-white/5 flex items-center justify-center border-2 transition-all ${showCustomPhotoInput ? 'border-[#38bdf8] scale-110 text-[#38bdf8] shadow-lg shadow-[#38bdf8]/20' : 'border-transparent text-white/50 hover:text-white hover:bg-white/10 hover:scale-105'}`}
                  
                >
                  <LinkIcon className="w-6 h-6" />
                </button>

                <label className="w-16 h-16 rounded bg-white/5 flex items-center justify-center border-2 border-transparent text-white/50 hover:text-white hover:bg-white/10 hover:scale-105 transition-all cursor-pointer" >
                  <Upload className="w-6 h-6" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              {showCustomPhotoInput && (
                <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-white/5 border border-white/10">
                    {profileData.photoURL && !AVATARS.includes(profileData.photoURL) ? (
                      <img referrerPolicy="no-referrer" src={profileData.photoURL} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4 text-white/30" /></div>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={!AVATARS.includes(profileData.photoURL) ? profileData.photoURL : ''}
                    onChange={e => setProfileData({...profileData, photoURL: e.target.value})}
                    placeholder="Enter custom image URL..."
                    className="flex-1 bg-black/50 border border-white/10 rounded py-2 px-3 text-xs md:text-sm text-white focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 items-center">
            <button 
              type="submit" 
              disabled={savingStatus === 'saving'}
              className="bg-[#38bdf8] hover:bg-[#0284c7] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mt-4"
            >
              {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'success' ? 'Saved!' : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="bg-transparent border border-white/20 hover:bg-white/5 text-white/70 px-6 py-2 rounded-lg font-medium transition-colors mt-4"
            >
              Sign Out
            </button>
            
            {!(userData?.isPremium || profileData.isPremium) && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  navigate('/premium');
                }}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B59410] text-black px-6 py-2 rounded-lg font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)] mt-4 flex items-center gap-2"
              >
                <Crown className="w-4 h-4" /> Upgrade to PRO
              </button>
            )}
            </div>
            {savingStatus === 'error' && <p className="text-red-400 text-xs md:text-sm mt-2">Failed to save profile. Please try again.</p>}
          </form>
          </div>
        </div>
      )}

      
      {/* Profile Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 mb-8 border-b border-white/10 w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`shrink-0 flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-[#38bdf8] text-white' 
                  : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
              }`}
            >
              <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] ${activeTab === tab.id ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'bg-white/10 text-white/50'}`}>
                {tab.count}
              </span>
            </button>
          ))}
          
      </div>

      <div>
        {renderActiveTabContent()}
      </div>
    </div>
  );
}
