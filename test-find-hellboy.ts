import { db } from './src/lib/firebase';
import { collection, query, getDocs } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const userId = userDoc.id;
    const actionsQ = query(collection(db, `users/${userId}/movieActions`));
    const actionsSnap = await getDocs(actionsQ);
    
    actionsSnap.docs.forEach(actionDoc => {
      const data = actionDoc.data();
      if (data.title?.toLowerCase().includes('hellboy') || data.movieData?.title?.toLowerCase().includes('hellboy')) {
         console.log(userDoc.data().email, "has Hellboy:", actionDoc.id, data);
      }
    });
  }
  process.exit(0);
}
run();
