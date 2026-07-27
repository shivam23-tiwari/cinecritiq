const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "ai-studio-055f4f09-d829-468f-8c2e-82d3aedffb1a",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching users...");
  const usersSnapshot = await getDocs(collection(db, "users"));
  for (const userDoc of usersSnapshot.docs) {
    const actionsSnapshot = await getDocs(collection(db, "users", userDoc.id, "movieActions"));
    for (const actionDoc of actionsSnapshot.docs) {
      if (actionDoc.id.startsWith("customPoster_")) {
        console.log(`Deleting custom poster for user ${userDoc.id}, doc ${actionDoc.id}`);
        await deleteDoc(actionDoc.ref);
      }
    }
  }
  console.log("Done");
}
run();
