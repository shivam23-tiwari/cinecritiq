import { db } from './src/lib/firebase';
import { collection, query, getDocs } from './src/lib/firestore-wrapper';

async function run() {
  const q = query(collection(db, 'users'));
  const snap = await getDocs(q);
  
  for (const userDoc of snap.docs) {
    const data = userDoc.data();
    const userId = userDoc.id;
    
    const customPosters: Record<string, string> = {};
    const allMoviesMap = new Map();
    
    const actionsQ = query(collection(db, `users/${userId}/movieActions`));
    const actionsSnap = await getDocs(actionsQ);
    
    actionsSnap.docs.forEach(actionDoc => {
      const actionData = actionDoc.data();
      const movieId = String(actionData.movieId || actionData.id || actionDoc.id.replace('rated_', '').replace('rating_', '').replace('watched_', '').replace('favorite_', '').replace('diary_', ''));
      
      if (actionData.actionType === 'customPoster' && actionData.customPosterUrl) {
        customPosters[movieId] = actionData.customPosterUrl;
      } else {
        if (!allMoviesMap.has(movieId)) {
          allMoviesMap.set(movieId, {
             id: movieId,
             title: actionData.movieData?.title || actionData.title,
             rating: 0
          });
        }
        const existing = allMoviesMap.get(movieId);
        if (actionData.rating) existing.rating = actionData.rating;
      }
    });

    const legacyCollections = ['favorites', 'watchlist', 'watched', 'ratings', 'diary'];
    for (const colName of legacyCollections) {
       const legacySnap = await getDocs(query(collection(db, `users/${userId}/${colName}`))).catch(() => null);
       if (legacySnap && legacySnap.docs) {
          legacySnap.docs.forEach(d => {
             const data = d.data();
             const movieId = String(data.id || data.movieId || d.id);
             if (!allMoviesMap.has(movieId)) {
               allMoviesMap.set(movieId, {
                 id: movieId,
                 title: data.title || data.movieData?.title,
                 rating: 0
               });
             }
             const existing = allMoviesMap.get(movieId);
             if (data.rating) existing.rating = data.rating;
          });
       }
    }
    
    const favoriteMovies = Array.from(allMoviesMap.values()).sort((a: any, b: any) => {
      if ((b.rating || 0) !== (a.rating || 0)) {
          return (b.rating || 0) - (a.rating || 0);
      }
      return String(a.id).localeCompare(String(b.id));
    }).slice(0, 4);
    
    console.log(data.displayName || data.email, ":", favoriteMovies.map(m => `${m.title} (${m.id}, rating: ${m.rating})`).join(' | '));
  }
  process.exit(0);
}
run();
