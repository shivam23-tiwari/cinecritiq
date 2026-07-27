const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
async function check() {
  const users = await db.collection('users').where('email', '==', 'shivamtiwari18107@gmail.com').get();
  users.forEach(doc => {
    console.log("User:", doc.id);
    const data = doc.data();
    console.log("photoURL length:", data.photoURL ? data.photoURL.length : 'none');
    console.log("displayName:", data.displayName);
  });
}
check();
