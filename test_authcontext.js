import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const uid = 'SckKs3wQ8BWSg5JBuh7IGj2IAH22';
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
      const data = userSnap.data();
      console.log('photoURL:', data.photoURL ? data.photoURL.substring(0, 30) : 'none');
      
      const currentUser = {
          uid: uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: ''
      };
      
      const updateData = {};
      if (!(userSnap.data()).photoURL && currentUser.photoURL) {
          updateData.photoURL = currentUser.photoURL;
      }
      console.log('Will update photoURL?', updateData.photoURL !== undefined);
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
