import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const targetId = 'I1LnEmTqpidk6x1dVCa8XMvr0Gw1';
  
  const sources = [
      'SckKs3wQ8BWSg5JBuh7IGj2IAH22',
      'YfyCpMlyrzcXCjalesDAapoXd082',
      'byhv1gOf1WQr9qf5LMO3PrAlEk82',
      'sVcwALv8VhOByAzTydwOgFg19kN2',
      'wTmLnpshgrUG8WPc8IxkEMNMoWm2',
      'ynnYjEjsZlcQWJBqQ0elmNFLUWT2'
  ];
  
  for (const src of sources) {
      console.log(`Merging ${src} into ${targetId}`);
      // Merge movieActions
      const acts = await getDocs(collection(db, 'users', src, 'movieActions'));
      for (const a of acts.docs) {
          await setDoc(doc(db, 'users', targetId, 'movieActions', a.id), a.data());
          await deleteDoc(a.ref);
      }
      
      // Update reviews
      const revs = await getDocs(collection(db, 'reviews'));
      for (const r of revs.docs) {
          if (r.data().userId === src) {
              await setDoc(r.ref, { ...r.data(), userId: targetId }, { merge: true });
          }
      }
      
      // Update posts
      const posts = await getDocs(collection(db, 'posts'));
      for (const p of posts.docs) {
          if (p.data().userId === src) {
              await setDoc(p.ref, { ...p.data(), userId: targetId }, { merge: true });
          }
      }
      
      // Delete source user
      await deleteDoc(doc(db, 'users', src));
  }
  console.log("Merge complete.");
  process.exit(0);
}
run();
