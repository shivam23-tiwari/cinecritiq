import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const users = await getDocs(collection(db, 'users'));
  for (const u of users.docs) {
      const acts = await getDocs(collection(db, 'users', u.id, 'movieActions'));
      for (const a of acts.docs) {
          console.log(a.data());
          process.exit(0);
      }
  }
}
run();
