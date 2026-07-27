import re

with open('src/lib/AuthContext.tsx', 'r') as f:
    content = f.read()

old_useEffect = """  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'users', user.uid, 'movieActions'), where('actionType', '==', 'customPoster'));
      const unsubscribe1 = onSnapshot(q, (snapshot) => {
        const posters: Record<string, string> = {};
        
        console.log("Got snapshot of custom posters, size:", snapshot.size);
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          console.log("Custom poster data:", data);
          if (data.url) {
            // Temporary cleanup for bad posters
            if (data.url.includes('firebasestorage') || data.url.includes('blob:') || (!data.url.startsWith("http") && !data.url.startsWith("data:"))) {
               console.log("Cleaning up poster", data.url);
               deleteDoc(docSnap.ref).catch(console.error);
               return;
            }
            posters[data.movieId || data.seriesId] = data.url;
          }
        });

        setCustomPosters(posters);
      }, (error) => {
        console.error("Error fetching custom posters:", error);
      });

      return () => unsubscribe1();
    } else {
      setCustomPosters({});
    }
  }, [user]);"""

new_useEffect = """  useEffect(() => {
    const loadLocalPosters = () => {
      try {
        const local = JSON.parse(localStorage.getItem('customPosters') || '{}');
        setCustomPosters(local);
      } catch (e) {
        console.error("Failed to parse local custom posters", e);
      }
    };

    if (user) {
      const q = query(collection(db, 'users', user.uid, 'movieActions'), where('actionType', '==', 'customPoster'));
      const unsubscribe1 = onSnapshot(q, (snapshot) => {
        const posters: Record<string, string> = {};
        
        console.log("Got snapshot of custom posters, size:", snapshot.size);
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          console.log("Custom poster data:", data);
          if (data.url) {
            // Temporary cleanup for bad posters
            if (data.url.includes('firebasestorage') || data.url.includes('blob:') || (!data.url.startsWith("http") && !data.url.startsWith("data:"))) {
               console.log("Cleaning up poster", data.url);
               deleteDoc(docSnap.ref).catch(console.error);
               return;
            }
            posters[data.movieId || data.seriesId] = data.url;
          }
        });
        
        try {
          const local = JSON.parse(localStorage.getItem('customPosters') || '{}');
          setCustomPosters({ ...local, ...posters });
        } catch (e) {
          setCustomPosters(posters);
        }
      }, (error) => {
        console.error("Error fetching custom posters:", error);
      });

      const handleLocalChange = () => {
        try {
          const local = JSON.parse(localStorage.getItem('customPosters') || '{}');
          setCustomPosters(prev => ({ ...prev, ...local }));
        } catch (e) {}
      };
      window.addEventListener('localPostersChanged', handleLocalChange);

      return () => {
        unsubscribe1();
        window.removeEventListener('localPostersChanged', handleLocalChange);
      };
    } else {
      loadLocalPosters();
      window.addEventListener('localPostersChanged', loadLocalPosters);
      return () => {
        window.removeEventListener('localPostersChanged', loadLocalPosters);
      };
    }
  }, [user]);"""

if old_useEffect in content:
    content = content.replace(old_useEffect, new_useEffect)
    with open('src/lib/AuthContext.tsx', 'w') as f:
        f.write(content)
    print("Successfully replaced AuthContext.")
else:
    print("Could not find the useEffect to replace in AuthContext.")

