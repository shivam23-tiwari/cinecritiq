import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const usersSnap = await getDocs(collection(db, "users"));
  console.log("Users count:", usersSnap.size);
  let targetUser = null;
  usersSnap.forEach(doc => {
    console.log("User:", doc.id, doc.data().displayName, doc.data().email);
    if (doc.data().email === 'shivamtiwari18107@gmail.com') {
      targetUser = doc.id;
    }
  });
  
  if (targetUser) {
     const ma = await getDocs(collection(db, `users/${targetUser}/movieActions`));
     console.log("movieActions count:", ma.size);
     const wl = await getDocs(collection(db, `users/${targetUser}/watchlist`));
     console.log("watchlist count:", wl.size);
     const fav = await getDocs(collection(db, `users/${targetUser}/favorites`));
     console.log("favorites count:", fav.size);
  }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
