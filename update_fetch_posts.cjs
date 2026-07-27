const fs = require('fs');
const content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const oldFetchUserPosts = `const fetchUserPosts = async () => {
         try {
            const postsQ = query(collection(db, 'posts'), where('userId', '==', user.uid));
            const snap = await getDocs(postsQ);
            const postsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by createdAt desc
            postsList.sort((a, b) => (b as any).createdAt?.toMillis() - (a as any).createdAt?.toMillis());
            setUserPosts(postsList);
         } catch (e) {
            if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) {
              console.error("Failed to fetch posts", e);
            } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
         }
      };`;

const newFetchUserPosts = `const fetchUserPosts = async () => {
         try {
            const postsQ = query(collection(db, 'posts'), where('userId', '==', user.uid));
            const postsSnap = await getDocs(postsQ);
            const postsList = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), feedType: 'post' }));
            
            const logsQ = query(collection(db, 'logs'), where('userId', '==', user.uid));
            const logsSnap = await getDocs(logsQ);
            const logsList = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), feedType: 'log' }));
            
            const combined = [...postsList, ...logsList];
            
            // Sort by createdAt desc
            combined.sort((a, b) => ((b as any).createdAt?.toMillis() || 0) - ((a as any).createdAt?.toMillis() || 0));
            setUserPosts(combined);
         } catch (e) {
            if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) {
              console.error("Failed to fetch posts/logs", e);
            } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
         }
      };`;

let newContent = content.replace(oldFetchUserPosts, newFetchUserPosts);

const oldTabs = `    { id: 'posts', label: 'Posts', icon: BookOpen, count: null },`;
const newTabs = `    { id: 'posts', label: 'Posts', icon: BookOpen, count: userPosts.length },`;
newContent = newContent.replace(oldTabs, newTabs);

fs.writeFileSync('src/pages/Profile.tsx', newContent);
