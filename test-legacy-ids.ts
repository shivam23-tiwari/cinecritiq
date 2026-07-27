import { db } from './src/lib/firebase';
import { collection, query, getDocs } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'byhv1gOf1WQr9qf5LMO3PrAlEk82'; // shivam 23 bp
  const legacySnap = await getDocs(query(collection(db, `users/${userId}/ratings`)));
  legacySnap.docs.forEach(d => {
      const data = d.data();
      if (!data.id && !data.movieId) {
         console.log("Missing id and movieId:", d.id, data);
      }
  });
  process.exit(0);
}
run();
