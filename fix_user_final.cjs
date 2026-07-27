const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fixUser() {
  const userRef = doc(db, 'users', 'SckKs3wQ8BWSg5JBuh7IGj2IAH22');
  await updateDoc(userRef, {
    displayName: 'shivam baby',
    instagramUsername: '@shivam.tiwari023',
    badges: ['Admin', 'CineVerse Pro', 'OG Member', 'Beta Tester', 'GOAT'],
    isPremium: true,
    mcqWinnerStarUntil: 9999999999999, // far future for GOAT tag
  });
  console.log('Fixed user SckKs...');
  process.exit(0);
}

fixUser().catch(e => { console.error(e); process.exit(1); });
