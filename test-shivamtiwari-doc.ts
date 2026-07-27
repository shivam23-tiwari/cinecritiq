import { db } from './src/lib/firebase';
import { doc, getDoc, collection, getDocs } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'SckKs3wQ8BWSg5JBuh7IGj2IAH22';
  const userDoc = await getDoc(doc(db, 'users', userId));
  console.log("shivamtiwari18107@gmail.com doc:", userDoc.data());
  
  const userId2 = 'byhv1gOf1WQr9qf5LMO3PrAlEk82';
  const userDoc2 = await getDoc(doc(db, 'users', userId2));
  console.log("shivam23bp@gmail.com doc1:", userDoc2.data());

  const userId3 = 'wTmLnpshgrUG8WPc8IxkEMNMoWm2';
  const userDoc3 = await getDoc(doc(db, 'users', userId3));
  console.log("shivam23bp@gmail.com doc2:", userDoc3.data());

  // Also check top4 subcollections if any exist
  const q = await getDocs(collection(db, `users/${userId}/top4`)).catch(()=>null);
  if(q) console.log("top4 subcol 1:", q.docs.map(d=>d.data()));
  
  const favs2 = await getDocs(collection(db, `users/${userId}/favoriteMovies`)).catch(()=>null);
  if (favs2) console.log("favs2:", favs2.docs.map(d=>d.data()));

  process.exit(0);
}
run();
