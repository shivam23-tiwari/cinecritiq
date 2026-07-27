import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const posts = await getDocs(collection(db, 'posts'));
  console.log(`Found ${posts.docs.length} posts`);
  posts.forEach(p => console.log(p.data()));
  process.exit(0);
}
run();
