import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = collection(db, 'users');
  const snap = await getDocs(q);
  const usersWithStats = snap.docs.filter(d => d.data().stats);
  console.log('Users with stats:', usersWithStats.length);
  process.exit(0);
}
run();
