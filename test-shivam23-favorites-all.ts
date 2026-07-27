import { db } from './src/lib/firebase';
import { collection, query, getDocs } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'byhv1gOf1WQr9qf5LMO3PrAlEk82'; 
  const favs = await getDocs(query(collection(db, `users/${userId}/favorites`)));
  favs.docs.forEach(d => console.log(d.id, d.data().title || d.data().movieData?.title));
  process.exit(0);
}
run();
