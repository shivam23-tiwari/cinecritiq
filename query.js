import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const usersSnap = await getDocs(collection(db, "users"));
  console.log("Users count:", usersSnap.size);
  usersSnap.forEach(doc => {
    console.log("User:", doc.id, doc.data().displayName, doc.data().email);
  });
}
run().catch(console.error);
