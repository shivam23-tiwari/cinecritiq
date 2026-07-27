import { db } from './src/lib/firebase';
import { collection, getDocs, query, doc } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const u = userDoc.data();
    
    // Check if there are favorites
    const favQ = query(collection(db, `users/${userDoc.id}/favorites`));
    const favs = await getDocs(favQ);
    console.log(u.email, "favs:", favs.size);
  }
  process.exit(0);
}
run().catch(console.error);
