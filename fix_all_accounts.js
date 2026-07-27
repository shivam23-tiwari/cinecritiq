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
  
  const actionsSnap = await getDocs(collection(db, 'users', 'SckKs3wQ8BWSg5JBuh7IGj2IAH22', 'movieActions'));
  const actions = actionsSnap.docs.map(d => ({id: d.id, data: d.data()}));
  
  for (const targetId of targetAccounts) {
      if (targetId === 'SckKs3wQ8BWSg5JBuh7IGj2IAH22') continue;
      console.log(`Copying to ${targetId}`);
      for (const a of actions) {
          await setDoc(doc(db, 'users', targetId, 'movieActions', a.id), a.data);
      }
      
      // Ensure user doc exists
      await setDoc(doc(db, 'users', targetId), {
         email: 'shivam23bp@gmail.com', 
         uid: targetId
      }, {merge: true});
  }
  
  console.log("All accounts synchronized.");
  process.exit(0);
}
run();
