import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const uid = 'SckKs3wQ8BWSg5JBuh7IGj2IAH22';
  
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  console.log('photoURL length:', snap.data().photoURL ? snap.data().photoURL.length : 'none');
  
  const currentUser = {
      uid: uid,
      email: snap.data().email,
      displayName: snap.data().displayName,
      photoURL: ''
  };
  
  const updateData = {
                 uid: currentUser.uid,
                 updatedAt: new Date()
               };
  if (!(snap.data()).photoURL && currentUser.photoURL) updateData.photoURL = currentUser.photoURL;
  
  await setDoc(userRef, updateData, { merge: true });
  
  const snap2 = await getDoc(userRef);
  console.log('photoURL length after update:', snap2.data().photoURL ? snap2.data().photoURL.length : 'none');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
