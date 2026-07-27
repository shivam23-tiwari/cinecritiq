import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const userRef = doc(db, 'users', 'shivamtiwari18107@gmail.com');
  const snap = await getDoc(userRef);
  if (snap.exists()) {
      console.log('User found!');
      const data = snap.data();
      console.log('photoURL:', data.photoURL ? data.photoURL.substring(0, 30) : 'none');
      console.log('displayName:', data.displayName);
  } else {
      console.log('User not found!');
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
