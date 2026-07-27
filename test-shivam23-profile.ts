import { db } from './src/lib/firebase';
import { collection, getDocs, query } from './src/lib/firestore-wrapper';

async function run() {
  const userId = 'SckKs3wQ8BWSg5JBuh7IGj2IAH22';
  const actionsQ = query(collection(db, `users/${userId}/movieActions`));
  const snap = await getDocs(actionsQ);
  const favsMap = new Map();
  const watchMap = new Map();
  const seenMap = new Map();
  const rateMap = new Map();
  const diaryMap = new Map();

  const processDocs = (docs: any[], defaultType?: string) => {
    docs.forEach(doc => {
      const data = doc.data();
      let movieObj = {
         id: data.movieId || data.id || parseInt(doc.id) || doc.id.replace(defaultType + '_', ''),
         title: data.movieData?.title || data.movieData?.name || data.title || data.name,
         rating: data.rating || 0
      };
      let type = data.actionType || defaultType;
      if (!type) {
         if (doc.id.startsWith('watched_')) type = 'watched';
         else if (doc.id.startsWith('watchlist_')) type = 'watchlist';
         else if (doc.id.startsWith('rated_') || doc.id.startsWith('rating_')) type = 'rated';
         else if (doc.id.startsWith('diary_')) type = 'diary';
         else type = 'favorite';
      }
      
      if (type === 'favorite') favsMap.set(String(movieObj.id), movieObj);
      if (type === 'watchlist') watchMap.set(String(movieObj.id), movieObj);
      if (type === 'watched') seenMap.set(String(movieObj.id), movieObj);
      if (type === 'rated') rateMap.set(String(movieObj.id), { ...movieObj, rating: data.rating });
      if (type === 'diary') diaryMap.set(String(movieObj.id), { ...movieObj, text: data.text });
    });
  };
  
  if (snap && snap.docs) processDocs(snap.docs);
  
  const legacyCollections = ['favorites', 'watchlist', 'watched', 'ratings', 'diary'];
  const legacyPromises = legacyCollections.map(colName => 
     getDocs(query(collection(db, `users/${userId}/${colName}`))).catch(() => null)
  );
  const legacySnaps = await Promise.all(legacyPromises);
  legacySnaps.forEach((s, idx) => {
     if (s && s.docs) processDocs(s.docs, legacyCollections[idx]);
  });
  
  const watched = Array.from(seenMap.values());
  const favorites = Array.from(favsMap.values());
  const diary = Array.from(diaryMap.values());
  const ratings = Array.from(rateMap.values());
  
  const allMoviesMap = new Map();
  [...watched, ...favorites, ...diary, ...ratings].forEach(m => {
    if (!allMoviesMap.has(String(m.id))) {
       allMoviesMap.set(String(m.id), { ...m, rating: 0 });
    }
    const existing = allMoviesMap.get(String(m.id));
    if (m.rating) existing.rating = m.rating;
  });
  const top4Movies = Array.from(allMoviesMap.values()).sort((a: any, b: any) => {
    if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0);
    }
    return String(a.id).localeCompare(String(b.id));
  }).slice(0, 4);
  
  console.log("Profile top 4:", top4Movies);
  
  process.exit(0);
}
run();
