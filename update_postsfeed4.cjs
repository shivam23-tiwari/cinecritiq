const fs = require('fs');
let code = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');

code = code.replace(
  /useEffect\(\(\) => \{\n    let q = collection\(db, 'posts'\);\n    let postsQuery;\n    if \(userId\) \{\n      postsQuery = query\(q, where\('userId', '==', userId\)\);\n    \} else \{\n      postsQuery = query\(q, orderBy\('createdAt', 'desc'\)\);\n    \}\n\n    const unsubscribe = onSnapshot\(postsQuery, \(snapshot\) => \{\n      const p = snapshot\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \} as Post\)\);\n      if \(userId\) \{\n        p\.sort\(\(a, b\) => \(b\.createdAt\?\.toMillis\(\) \|\| 0\) - \(a\.createdAt\?\.toMillis\(\) \|\| 0\)\);\n      \}\n      setPosts\(p\);\n      setLoading\(false\);\n    \}, \(err\) => \{\n      console\.error\(err\);\n      setLoading\(false\);\n    \}\);\n    return \(\) => unsubscribe\(\);\n  \}, \[userId\]\);/,
  `useEffect(() => {
    let postsQuery;
    if (userId) {
      postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
    } else {
      postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    }

    let logsQuery;
    if (userId) {
      logsQuery = query(collection(db, 'logs'), where('userId', '==', userId));
    } else {
      logsQuery = query(collection(db, 'logs'), orderBy('createdAt', 'desc'));
    }

    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data(), feedType: 'post' } as any));
      
      onSnapshot(logsQuery, (logsSnapshot) => {
        const l = logsSnapshot.docs.map(d => ({ id: d.id, ...d.data(), feedType: 'log' } as any));
        
        const combined = [...p, ...l].sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setPosts(combined);
        setLoading(false);
      });
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubPosts();
  }, [userId]);`
);

fs.writeFileSync('src/components/PostsFeed.tsx', code);
