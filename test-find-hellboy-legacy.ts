import { db } from './src/lib/firebase';
import { collection, query, getDocs } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const userId = userDoc.id;
    const legacyCollections = ['favorites', 'watchlist', 'watched', 'ratings', 'diary'];
    for (const colName of legacyCollections) {
       const legacySnap = await getDocs(query(collection(db, `users/${userId}/${colName}`))).catch(() => null);
       if (legacySnap && legacySnap.docs) {
          legacySnap.docs.forEach(d => {
             const data = d.data();
             if (data.title?.toLowerCase().includes('hellboy') || data.movieData?.title?.toLowerCase().includes('hellboy')) {
                 console.log(userDoc.data().email, "has Hellboy in", colName, ":", d.id, data);
             }
          });
       }
    }
  }
  process.exit(0);
}
run();
