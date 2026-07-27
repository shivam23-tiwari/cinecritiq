import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const users = await getDocs(collection(db, 'users'));
  
  const toDelete = [
      'DIepLBPO3nNieckgrNot85FAunk1',
      'YfyCpMlyrzcXCjalesDAapoXd082',
      'byhv1gOf1WQr9qf5LMO3PrAlEk82',
      'sVcwALv8VhOByAzTydwOgFg19kN2',
      'wTmLnpshgrUG8WPc8IxkEMNMoWm2',
      'ynnYjEjsZlcQWJBqQ0elmNFLUWT2'
  ];
  for(let id of toDelete) {
      await deleteDoc(doc(db, 'users', id));
      console.log('deleted', id);
  }
}
run();
