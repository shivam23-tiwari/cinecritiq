import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = collection(db, 'users');
  const snap = await getDocs(q);
  console.log(snap.docs.map(d => ({id: d.id, email: d.data().email, displayName: d.data().displayName})));
  process.exit(0);
}
run();
