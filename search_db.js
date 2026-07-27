import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const reviews = await getDocs(collection(db, 'reviews'));
  reviews.forEach(r => console.log(r.id, r.data().content));
  process.exit(0);
}
run();
