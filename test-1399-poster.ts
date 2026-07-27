import { db } from './src/lib/firebase';
import { collection, query, getDocs, where } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'byhv1gOf1WQr9qf5LMO3PrAlEk82'; 
  const actionsQ = query(collection(db, `users/${userId}/movieActions`), where('actionType', '==', 'customPoster'));
  const actionsSnap = await getDocs(actionsQ);
  actionsSnap.docs.forEach(d => {
    if (d.data().movieId == '1399' || d.data().movieId === 1399) {
       console.log("1399 custom poster:", d.id, d.data());
    }
  });
  process.exit(0);
}
run();
