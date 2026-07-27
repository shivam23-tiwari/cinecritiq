import { db } from './src/lib/firebase';
import { collection, getDocs, query, where } from './src/lib/firestore-wrapper';

async function run() {
  const q = query(collection(db, 'users'));
  const snap = await getDocs(q);
  console.log("Users:", snap.size);
  process.exit(0);
}
run().catch(console.error);
