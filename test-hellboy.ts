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
      if (actionData.title?.includes('Hellboy') || actionData.movieData?.title?.includes('Hellboy')) {
         console.log(userDoc.data().email, "has Hellboy action:", actionDoc.id, actionData);
      }
    });

    const legacyRatings = await getDocs(query(collection(db, `users/${userId}/ratings`))).catch(() => null);
    if (legacyRatings && legacyRatings.docs) {
       legacyRatings.docs.forEach(d => {
          const data = d.data();
          if (data.title?.includes('Hellboy') || data.movieData?.title?.includes('Hellboy')) {
             console.log(userDoc.data().email, "has Hellboy legacy rating:", d.id, data);
          }
       });
    }
  }
  process.exit(0);
}
run().catch(console.error);
