import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const u1 = 'SckKs3wQ8BWSg5JBuh7IGj2IAH22';
  const u2 = 'I1LnEmTqpidk6x1dVCa8XMvr0Gw1';
  
  // recreate u2 if deleted
  await setDoc(doc(db, 'users', u2), {
      email: 'shivavmtiwari18107@gmail.com',
      displayName: 'shivam',
      uid: u2,
      createdAt: new Date(),
      updatedAt: new Date()
  }, { merge: true });
  
  const acts1 = await getDocs(collection(db, 'users', u1, 'movieActions'));
  for (const a of acts1.docs) {
      await setDoc(doc(db, 'users', u2, 'movieActions', a.id), a.data());
  }
  
  const acts2 = await getDocs(collection(db, 'users', u2, 'movieActions'));
  for (const a of acts2.docs) {
      await setDoc(doc(db, 'users', u1, 'movieActions', a.id), a.data());
  }
  
  console.log("Copy complete.");
  process.exit(0);
}
run();
