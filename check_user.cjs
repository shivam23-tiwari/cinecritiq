const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const targetRef = doc(db, 'users', 'SckKs3wQ8BWSg5JBuh7IGj2IAH22');
  const targetDoc = await getDoc(targetRef);
  console.log(JSON.stringify(targetDoc.data(), null, 2));
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
