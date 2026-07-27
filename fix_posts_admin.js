import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const targetAccounts = [
      'SckKs3wQ8BWSg5JBuh7IGj2IAH22',
      'YfyCpMlyrzcXCjalesDAapoXd082',
      'byhv1gOf1WQr9qf5LMO3PrAlEk82',
      'sVcwALv8VhOByAzTydwOgFg19kN2',
      'wTmLnpshgrUG8WPc8IxkEMNMoWm2',
      'ynnYjEjsZlcQWJBqQ0elmNFLUWT2',
      'I1LnEmTqpidk6x1dVCa8XMvr0Gw1'
  ];
  
  const postsSnap = await getDocs(collection(db, 'posts'));
  const posts = postsSnap.docs.map(d => ({id: d.id, data: d.data()}));
  
  for (const p of posts) {
    if (p.data.userId === 'I1LnEmTqpidk6x1dVCa8XMvr0Gw1') {
      // Re-assign it to SckKs3wQ8BWSg5JBuh7IGj2IAH22 as well? Or duplicate it?
      // Just duplicate it for SckKs3wQ8BWSg5JBuh7IGj2IAH22
      const newPostId = p.id + '_cloned';
      await setDoc(doc(db, 'posts', newPostId), {
         ...p.data,
         userId: 'SckKs3wQ8BWSg5JBuh7IGj2IAH22'
      });
      console.log('Duplicated post for SckKs3wQ8BWSg5JBuh7IGj2IAH22');
    }
  }
  
  console.log("All posts synchronized.");
  process.exit(0);
}
run();
