import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, orderBy, getDocs } from "firebase/firestore";
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const q = query(collection(db, 'reviews'), where('movieId', '==', 'some_id'), orderBy('createdAt', 'desc'));
    await getDocs(q);
    console.log("Query succeeded!");
  } catch(e) {
    console.log("Query failed:", e.message);
  }
  process.exit(0);
}
run();
