import { db } from './src/lib/firebase';
import { collection, getDocs, query } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const data = userDoc.data();
    console.log(userDoc.id, data.email, data.displayName);
  }
  process.exit(0);
}
run().catch(console.error);
