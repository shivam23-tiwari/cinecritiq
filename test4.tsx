import { db } from './src/lib/firebase';
import { collection, getDocs, query, where } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const data = userDoc.data();
    if (data.isPremium) console.log(data.email, "is premium");
    if (data.mcqWinnerStarUntil) console.log(data.email, "is goat");
  }
  process.exit(0);
}
run().catch(console.error);
