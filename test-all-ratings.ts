import { db } from './src/lib/firebase';
import { collection, getDocs, query } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const userId = userDoc.id;
    const rateMap = new Map();
    const actionsQ = query(collection(db, `users/${userId}/movieActions`));
    const actionsSnap = await getDocs(actionsQ);
    
    actionsSnap.docs.forEach(actionDoc => {
      const actionData = actionDoc.data();
      const movieId = String(actionData.movieId || actionData.id || actionDoc.id.replace('rated_', '').replace('rating_', ''));
      if (actionData.actionType === 'rated' || actionData.actionType === 'diary') {
        rateMap.set(movieId, {
           id: movieId,
           title: actionData.movieData?.title || actionData.title,
           rating: actionData.rating || 0
        });
      }
    });

    const legacyRatings = await getDocs(query(collection(db, `users/${userId}/ratings`))).catch(() => null);
    if (legacyRatings && legacyRatings.docs) {
       legacyRatings.docs.forEach(d => {
          const data = d.data();
          const movieId = String(data.id || data.movieId || d.id);
          if (!rateMap.has(movieId)) {
            rateMap.set(movieId, {
              id: movieId,
              title: data.title || data.movieData?.title,
              rating: data.rating || 0
            });
          }
       });
    }

    const movies = Array.from(rateMap.values())
       .sort((a,b) => {
         if (b.rating !== a.rating) return b.rating - a.rating;
         return String(a.id).localeCompare(String(b.id));
       })
       .slice(0, 5);
    
    console.log(userDoc.id, userDoc.data().email, "favorites:", movies.map(m => m.title).join(', '));
  }
  process.exit(0);
}
run().catch(console.error);
