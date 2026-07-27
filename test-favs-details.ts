import { db } from './src/lib/firebase';
import { collection, getDocs, query } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const userId = userDoc.id;
    let favs = [];
    
    // Check movieActions
    const actionsQ = query(collection(db, `users/${userId}/movieActions`));
    const actionsSnap = await getDocs(actionsQ);
    actionsSnap.docs.forEach(d => { 
      const data = d.data();
      if(data.actionType === 'favorite') {
        favs.push({ id: data.movieId || data.id, title: data.movieData?.title || data.title });
      }
    });
    
    // Check legacy favorites
    const favQ = query(collection(db, `users/${userId}/favorites`));
    const favSnap = await getDocs(favQ);
    favSnap.docs.forEach(d => {
      const data = d.data();
      favs.push({ id: data.id || data.movieId, title: data.title || data.movieData?.title });
    });
    
    if (favs.length > 0) {
      console.log(userDoc.data().email, "favs:", favs.slice(0, 4).map(f => f.title).join(', '));
    }
  }
  process.exit(0);
}
run().catch(console.error);
