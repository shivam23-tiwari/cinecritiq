import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  snap.forEach(doc => {
     const data = doc.data();
     if (data.email === 'shivam23bp@gmail.com' && data.updatedAt && data.updatedAt.toDate) {
         if (data.updatedAt.toDate().getTime() > new Date('2026-07-26T11:00:00Z').getTime()) {
             console.log('Found recent user:', doc.id);
             console.log('photoURL length:', data.photoURL ? data.photoURL.length : 'none');
             console.log('photoURL prefix:', data.photoURL ? data.photoURL.substring(0, 30) : '');
         }
     }
  });
}
test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
