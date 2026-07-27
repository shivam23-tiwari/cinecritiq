import { db } from './src/lib/firebase';
import { collection, query, getDocs, where } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'byhv1gOf1WQr9qf5LMO3PrAlEk82'; // shivam 23 bp
  const actionsQ = query(collection(db, `users/${userId}/movieActions`), where('actionType', '==', 'customPoster'));
  const actionsSnap = await getDocs(actionsQ);
  console.log("shivam 23 custom posters:");
  actionsSnap.docs.forEach(d => console.log(d.id, d.data()));
  process.exit(0);
}
run();
