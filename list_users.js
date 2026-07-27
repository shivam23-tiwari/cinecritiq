import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getDoc, doc } from "firebase/firestore";
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const users = await getDocs(collection(db, 'users'));
  for (const u of users.docs) {
    const actions = await getDocs(collection(db, `users/${u.id}/movieActions`));
    console.log(`User ${u.id} (${u.data().email}) has ${actions.size} movieActions`);
  }
  process.exit(0);
}
run();
