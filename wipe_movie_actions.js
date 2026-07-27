import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const targetUser = 'I1LnEmTqpidk6x1dVCa8XMvr0Gw1'; // main user
  const otherUsers = [
      'SckKs3wQ8BWSg5JBuh7IGj2IAH22',
      'YfyCpMlyrzcXCjalesDAapoXd082',
      'byhv1gOf1WQr9qf5LMO3PrAlEk82',
      'sVcwALv8VhOByAzTydwOgFg19kN2',
      'wTmLnpshgrUG8WPc8IxkEMNMoWm2',
      'ynnYjEjsZlcQWJBqQ0elmNFLUWT2'
  ];
  
  for (const uid of otherUsers) {
    const actions = await getDocs(collection(db, `users/${uid}/movieActions`));
    for (const docSnap of actions.docs) {
      await deleteDoc(docSnap.ref);
    }
    console.log(`Wiped ${actions.size} actions for ${uid}`);
  }
  process.exit(0);
}
run();
