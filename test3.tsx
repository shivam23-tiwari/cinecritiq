import { db } from './src/lib/firebase';
import { collection, getDocs, query, where } from './src/lib/firestore-wrapper';

async function run() {
  const usersQ = query(collection(db, 'users'));
  const snap = await getDocs(usersQ);
  
  for (const userDoc of snap.docs) {
    const actionsQ = query(collection(db, `users/${userDoc.id}/movieActions`));
    const actions = await getDocs(actionsQ);
    let favs = 0; let watched = 0;
    actions.docs.forEach(d => {
      const data = d.data();
      if (data.actionType === 'favorite') favs++;
      if (data.actionType === 'watched' || data.actionType === 'rated' || data.actionType === 'diary') watched++;
    });
    if (actions.size > 0) {
      console.log(userDoc.data().email, "actions:", actions.size, "favs:", favs, "watched:", watched);
    }
  }
  process.exit(0);
}
run().catch(console.error);
