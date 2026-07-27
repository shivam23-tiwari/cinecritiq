import { db } from './src/lib/firebase';
import { collection, query, getDocs } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'byhv1gOf1WQr9qf5LMO3PrAlEk82'; // shivam 23 bp
  const legacySnap = await getDocs(query(collection(db, `users/${userId}/ratings`)));
  legacySnap.docs.forEach(d => {
      const data = d.data();
      console.log("rating:", d.id, data.title || data.movieData?.title, data.rating);
  });

  const actionsSnap = await getDocs(query(collection(db, `users/${userId}/movieActions`)));
  actionsSnap.docs.forEach(d => {
      const data = d.data();
      if (data.rating) {
         console.log("action rating:", d.id, data.title || data.movieData?.title, data.rating);
      }
  });
  process.exit(0);
}
run();
