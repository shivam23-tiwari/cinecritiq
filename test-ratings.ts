import { db } from './src/lib/firebase';
import { collection, getDocs, query } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const userId = userDoc.id;
    let ratings = [];
    
    // Check movieActions
    const actionsQ = query(collection(db, `users/${userId}/movieActions`));
    const actionsSnap = await getDocs(actionsQ);
    actionsSnap.docs.forEach(d => { 
      const data = d.data();
      if(data.actionType === 'rated' || data.actionType === 'diary') {
        ratings.push({ id: data.movieId || data.id, title: data.movieData?.title || data.title, rating: data.rating || 0 });
      }
    });
    
    // Legacy ratings
    const legQ = query(collection(db, `users/${userId}/ratings`));
    const legSnap = await getDocs(legQ);
    legSnap.docs.forEach(d => {
      const data = d.data();
      ratings.push({ id: data.id || data.movieId, title: data.title || data.movieData?.title, rating: data.rating || 0 });
    });
    
    if (ratings.length > 0) {
      const top4 = ratings.sort((a,b) => b.rating - a.rating).slice(0, 4);
      console.log(userDoc.data().email, "top 4 ratings:", top4.map(r => `${r.title} (${r.rating})`).join(', '));
    }
  }
  process.exit(0);
}
run().catch(console.error);
