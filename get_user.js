import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const users = await getDocs(collection(db, 'users'));
  users.forEach(u => console.log(u.id, u.data().email, u.data().displayName));
  process.exit(0);
}
run();
