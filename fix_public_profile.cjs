const fs = require('fs');
const content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

const oldFetchUserPosts = `      const fetchUserPosts = async () => {
         try {
            const postsQ = query(collection(db, 'posts'), where('userId', '==', id));
            const snap = await getDocs(postsQ);
            const postsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            postsList.sort((a, b) => (b as any).createdAt?.toMillis() - (a as any).createdAt?.toMillis());
            setUserPosts(postsList);
         } catch (e) {
            console.error("Failed to fetch posts", e);
         }
      };`;

const newFetchUserPosts = `      const fetchUserPosts = async () => {
         try {
            const postsQ = query(collection(db, 'posts'), where('userId', '==', id));
            const postsSnap = await getDocs(postsQ);
            const postsList = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), feedType: 'post' }));
            
            const logsQ = query(collection(db, 'logs'), where('userId', '==', id));
            const logsSnap = await getDocs(logsQ);
            const logsList = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), feedType: 'log' }));
            
            const combined = [...postsList, ...logsList];
            combined.sort((a, b) => ((b as any).createdAt?.toMillis() || 0) - ((a as any).createdAt?.toMillis() || 0));
            setUserPosts(combined);
         } catch (e) {
            console.error("Failed to fetch posts/logs", e);
         }
      };`;

let newContent = content.replace(oldFetchUserPosts, newFetchUserPosts);

const oldTabs = `    { id: 'posts', label: 'Posts', icon: BookOpen, count: null },`;
const newTabs = `    { id: 'posts', label: 'Posts', icon: BookOpen, count: userPosts.length },`;
newContent = newContent.replace(oldTabs, newTabs);

fs.writeFileSync('src/pages/PublicProfile.tsx', newContent);
