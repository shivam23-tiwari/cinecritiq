import fs from 'fs';

const profileSrc = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// We can replace the top part with PublicProfile imports, useParams, and use it exactly.
// To handle the follow buttons, we can inject the Follow logic.

let newSrc = profileSrc.replace(/export default function Profile\(\) \{/, `import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function PublicProfile() {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);`);

newSrc = newSrc.replace(/const { user, loading, customPosters, logout } = useAuth\(\);/, `const { user: currentUser, loading: authLoading, customPosters } = useAuth();
  const user = { uid: userId, email: profileUser?.email || '' }; // Fake user object to fool the rest of the code`);

// Wait, the fetching logic in Profile.tsx has:
// if (!loading && !user) { navigate('/'); }
newSrc = newSrc.replace(/if \(!loading && !user\)/g, `if (!userId)`);
newSrc = newSrc.replace(/const userRef = doc\(db, 'users', user\.uid\);/g, `const userRef = doc(db, 'users', userId!);`);

// Now add the fetching of Follow stuff:
newSrc = newSrc.replace(/const followersQuery = query\(collection\(db, \`users\/\$\{user\.uid\}\/followers\`\)\);/, `
          // Fetch User Profile
          const userSnapMain = await getDoc(userRef);
          if (userSnapMain.exists()) {
            setProfileUser({ id: userSnapMain.id, ...userSnapMain.data() });
          }
          if (currentUser) {
            const followSnap = await getDoc(doc(db, \`users/\${userId}/followers\`, currentUser.uid));
            setIsFollowing(followSnap.exists());
            const followerSnap = await getDoc(doc(db, \`users/\${currentUser.uid}/followers\`, userId!));
            setIsFollower(followerSnap.exists());
          }
          const followersQuery = query(collection(db, \`users/\${userId}/followers\`));`);

newSrc = newSrc.replace(/<button\s*onClick=\{handleClearPosters\}[\s\S]*?<\/button>/g, '');
newSrc = newSrc.replace(/<button\s*onClick=\{logout\}[\s\S]*?<\/button>/g, '');
newSrc = newSrc.replace(/<button\s*onClick=\{\(\) => setIsEditing\(true\)\}[\s\S]*?<\/button>/g, '');

// Inject handleFollowToggle
newSrc = newSrc.replace(/const renderActiveTabContent = \(\) => \{/, `
  const handleFollowToggle = async () => {
    if (!currentUser || !userId || currentUser.uid === userId) return;
    setFollowLoading(true);
    try {
      const followerRef = doc(db, \`users/\${userId}/followers\`, currentUser.uid);
      const followingRef = doc(db, \`users/\${currentUser.uid}/following\`, userId);

      if (isFollowing) {
        await deleteDoc(followerRef);
        await deleteDoc(followingRef);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await setDoc(followerRef, {
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        });
        await setDoc(followingRef, {
          userId: userId,
          createdAt: serverTimestamp()
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const renderActiveTabContent = () => {`);

// Inject follow button into header
newSrc = newSrc.replace(/<div className="flex flex-col md:flex-row items-center gap-3">/, `
{currentUser && currentUser.uid !== userId && (
  <div className="absolute top-4 right-4 z-20">
    <button
      onClick={handleFollowToggle}
      disabled={followLoading}
      className={\`px-6 py-2 rounded-full font-bold transition-all flex items-center justify-center gap-2 \${
        isFollowing 
          ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
          : 'bg-[#E50914] text-white hover:bg-[#b80710] shadow-[0_0_20px_rgba(229,9,20,0.4)]'
      } disabled:opacity-50\`}
    >
      {followLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <Users className="w-5 h-5" />
          {isFollowing ? 'Following' : isFollower ? 'Follow Back' : 'Follow'}
        </>
      )}
    </button>
  </div>
)}
<div className="flex flex-col md:flex-row items-center gap-3">`);

// Hide Add to Diary and other edit buttons
newSrc = newSrc.replace(/<button\s*onClick=\{\(\) => setShowAddDiaryModal\(true\)\}[\s\S]*?<\/button>/g, '');
newSrc = newSrc.replace(/<button\s*onClick=\{\(\) => navigate\('\/lists'\)\}[\s\S]*?<\/button>/g, '');

fs.writeFileSync('src/pages/PublicProfile.tsx', newSrc);
console.log("Converted Profile to PublicProfile");
