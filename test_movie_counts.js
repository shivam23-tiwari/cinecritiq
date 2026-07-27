import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const users = await getDocs(collection(db, 'users'));
  for (const u of users.docs) {
      const email = u.data().email || 'unknown';
      if (!email.includes('shivam') && !email.includes('tabar')) continue;
      const acts = await getDocs(collection(db, 'users', u.id, 'movieActions'));
      let w=0, l=0, r=0, rw=0;
      acts.forEach(a => {
          const type = a.data().actionType || (a.id.startsWith('watched_') ? 'watched' : a.id.startsWith('rated_') ? 'rated' : 'favorite');
          if(type === 'watched') w++;
          if(type === 'favorite') l++;
          if(type === 'rated') r++;
      });
      console.log(`${email} (id: ${u.id}) - Watched: ${w}, Liked: ${l}, Rated: ${r}`);
  }
}
run();
