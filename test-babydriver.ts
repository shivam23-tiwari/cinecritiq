import { db } from './src/lib/firebase';
import { collection, query, getDocs } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'byhv1gOf1WQr9qf5LMO3PrAlEk82'; 
  const actionsQ = query(collection(db, `users/${userId}/movieActions`));
  const snap = await getDocs(actionsQ);
  snap.docs.forEach(d => {
     const data = d.data();
     if (data.title === 'Baby Driver' || data.movieData?.title === 'Baby Driver') {
        console.log("Baby Driver in actions:", d.id, data);
     }
  });
  process.exit(0);
}
run();
