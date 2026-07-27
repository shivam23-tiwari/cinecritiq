import { db } from './src/lib/firebase';
import { collection, getDocs, query, where } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'SckKs3wQ8BWSg5JBuh7IGj2IAH22';
  
  const actionsQ = query(collection(db, `users/${userId}/movieActions`));
  const actionsSnap = await getDocs(actionsQ);
  actionsSnap.docs.forEach(d => {
    const data = d.data();
    if (data.actionType === 'rated' || data.actionType === 'diary') {
       console.log("action", d.id, data.movieId, data.id, data.movieData?.title || data.title, data.rating);
    }
  });

  const legQ = query(collection(db, `users/${userId}/ratings`));
  const legSnap = await getDocs(legQ);
  legSnap.docs.forEach(d => {
    const data = d.data();
    console.log("legacy", d.id, data.movieId, data.id, data.movieData?.title || data.title, data.rating);
  });
  process.exit(0);
}
run().catch(console.error);
