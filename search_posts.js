import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const posts = await getDocs(collection(db, 'posts'));
  posts.forEach(r => console.log(r.id, r.data().content));
  process.exit(0);
}
run();
