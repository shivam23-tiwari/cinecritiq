const fs = require('fs');
const content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const regex = /const fetchExtendedProfile = async \(\) => \{[\s\S]*?setFollowingCount\(followingSnap\.size\);/;

const newBlock = `const fetchExtendedProfile = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          let currentDisplayName = user.displayName || '';
          let currentPhotoURL = user.photoURL || '';
          
          if (userSnap.exists()) {
            const data: any = userSnap.data();
            currentDisplayName = data.displayName || currentDisplayName;
            currentPhotoURL = data.photoURL || currentPhotoURL;
            
            setProfileData(prev => ({
              ...prev,
              displayName: currentDisplayName,
              photoURL: currentPhotoURL,
              mobileNumber: data.mobileNumber || '',
              instagramUsername: data.instagramUsername || '',
              isPremium: data.isPremium || false,
              mcqWinnerStarUntil: data.mcqWinnerStarUntil || null
            }));
          }

          // Self-heal: check if posts have wrong name
          const { updateDoc } = await import('../lib/firestore-wrapper');
          const postsQ = query(collection(db, 'posts'), where('userId', '==', user.uid));
          const postsSnap = await getDocs(postsQ);
          let needsUpdate = false;
          const updates: any[] = [];
          
          postsSnap.forEach(postDoc => {
             const data: any = postDoc.data();
             if (data.userName !== currentDisplayName || data.userPhoto !== currentPhotoURL) {
                needsUpdate = true;
                updates.push(updateDoc(doc(db, 'posts', postDoc.id), {
                   userName: currentDisplayName,
                   userPhoto: currentPhotoURL
                }));
             }
          });
          
          const reviewsQ = query(collection(db, 'reviews'), where('userId', '==', user.uid));
          const reviewsSnap = await getDocs(reviewsQ);
          reviewsSnap.forEach(reviewDoc => {
             const data: any = reviewDoc.data();
             if (data.userName !== currentDisplayName || data.userPhoto !== currentPhotoURL) {
                needsUpdate = true;
                updates.push(updateDoc(doc(db, 'reviews', reviewDoc.id), {
                   userName: currentDisplayName,
                   userPhoto: currentPhotoURL
                }));
             }
          });
          
          if (needsUpdate && updates.length > 0) {
             await Promise.all(updates);
             console.log("Self-healed user posts and reviews names.");
          }

          const followersQuery = query(collection(db, \`users/\${user.uid}/followers\`));
          const followingQuery = query(collection(db, \`users/\${user.uid}/following\`));
          
          const [followersSnap, followingSnap] = await Promise.all([
            getDocs(followersQuery).catch(() => ({ size: 0 })),
            getDocs(followingQuery).catch(() => ({ size: 0 }))
          ]);
          
          setFollowersCount(followersSnap.size);
          setFollowingCount(followingSnap.size);`;

const newContent = content.replace(regex, newBlock);
if (newContent !== content) {
  fs.writeFileSync('src/pages/Profile.tsx', newContent);
  console.log("Success");
} else {
  console.log("No match found");
}
