import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function simulate() {
  const uid = 'shivamtiwari_test_uid'; // mock
  const userRef = doc(db, 'users', uid);

  // 1. User uploads photo and clicks save
  await setDoc(userRef, { photoURL: 'data:image/jpeg;base64,xxxxxx' }, { merge: true });
  console.log('Saved data URL to Firestore');

  // 2. AuthContext runs onAuthStateChanged
  const userSnap = await getDoc(userRef);
  const currentUserPhotoURL = 'https://api.dicebear.com/7.x/b'; // safePhotoURL fallback
  const updateData = {};
  if (!userSnap.data().photoURL && currentUserPhotoURL) {
     updateData.photoURL = currentUserPhotoURL;
     console.log('Overwriting photoURL in Firestore to', currentUserPhotoURL);
  } else {
     console.log('Not overwriting photoURL. Existing:', userSnap.data().photoURL);
  }
}

simulate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
