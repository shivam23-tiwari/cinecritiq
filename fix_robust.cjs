const fs = require('fs');
const content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const regex = /let safePhotoURL = profileData\.photoURL;[\s\S]*?await setDoc\(userRef, updateData, { merge: true }\);/m;

const newBlock = `const userRef = doc(db, 'users', user.uid);
      const updateData: any = {
        uid: user.uid,
        displayName: profileData.displayName || '',
        photoURL: profileData.photoURL || '', 
        mobileNumber: profileData.mobileNumber || '',
        instagramUsername: profileData.instagramUsername || '',
        updatedAt: serverTimestamp()
      };
                  
      await setDoc(userRef, updateData, { merge: true });

      let safePhotoURL = profileData.photoURL;
      if (safePhotoURL && safePhotoURL.startsWith('data:image') && safePhotoURL.length > 4000) {
        // Firebase Auth fails on long data URLs
        safePhotoURL = user.photoURL || ''; 
       }
            
      try {
        await updateProfile(auth.currentUser!, {
          displayName: profileData.displayName,
          photoURL: safePhotoURL
        });
      } catch (authErr) {
        console.warn("Could not update auth profile, continuing to save to Firestore", authErr);
      }`;

const newContent = content.replace(regex, newBlock);
if (newContent !== content) {
  fs.writeFileSync('src/pages/Profile.tsx', newContent);
  console.log("Success");
} else {
  console.log("No match found");
}
