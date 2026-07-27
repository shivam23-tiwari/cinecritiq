import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  snap.forEach(doc => {
     const data = doc.data();
     if (data.email === 'shivamtiwari18107@gmail.com') {
         console.log('Found user:', doc.id);
         console.log('photoURL:', data.photoURL ? data.photoURL.substring(0, 30) : 'none');
     }
  });
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
