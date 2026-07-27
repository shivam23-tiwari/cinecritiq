import fs from 'fs';

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Name
content = content.replace('export default function Profile() {', 'import { useParams } from \'react-router-dom\';\nimport { Users } from \'lucide-react\';\nexport default function PublicProfile() {\n  const { id: userId } = useParams();\n  const [profileUser, setProfileUser] = useState<any>(null);\n  const [followersCount, setFollowersCount] = useState(0);\n  const [followingCount, setFollowingCount] = useState(0);\n  const [isFollowing, setIsFollowing] = useState(false);\n  const [isFollower, setIsFollower] = useState(false);\n');

// 1. replace specific fetch hooks with userId
content = content.replace(/where\('userId', '==', user\.uid\)/g, "where('userId', '==', userId)");
content = content.replace(/`users\/\$\{user\.uid\}\/movieActions`/g, "`users/${userId}/movieActions`");

// 2. Add profile user fetch logic inside the useEffect
let fetchTarget = `      const fetchUserPosts = async () => {`;
let profileFetchCode = `
      const fetchExtendedProfile = async () => {
        try {
          const userRef = doc(db, 'users', userId!);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfileUser(userSnap.data());
          }
          if (user) {
            const followSnap = await getDoc(doc(db, \`users/\${userId}/followers\`, user.uid));
            setIsFollowing(followSnap.exists());
            const followerSnap = await getDoc(doc(db, \`users/\${user.uid}/followers\`, userId!));
            setIsFollower(followerSnap.exists());
          }
          const followersQuery = query(collection(db, \`users/\${userId}/followers\`));
          const followingQuery = query(collection(db, \`users/\${userId}/following\`));
          const [followersSnap, followingSnap] = await Promise.all([
            getDocs(followersQuery).catch(() => ({ size: 0 })),
            getDocs(followingQuery).catch(() => ({ size: 0 }))
          ]);
          setFollowersCount(followersSnap.size);
          setFollowingCount(followingSnap.size);
        } catch (e) {
          console.error(e);
        }
      };
      fetchExtendedProfile();
`;
content = content.replace(fetchTarget, profileFetchCode + '\n' + fetchTarget);

// Remove the `if (!loading && !user) { navigate('/') }` because PublicProfile can be viewed by anyone?
// But actually `user` might be used. We'll leave it but change `if (user)` to `if (userId)`
content = content.replace(/if \(!loading && !user\)/g, "if (!userId)");
// Change the main data fetching useEffect condition
content = content.replace(/if \(user\) \{/g, "if (userId) {");
content = content.replace(/\[user\]\);/g, "[user, userId]);");

// 3. Remove all editing functionalities
content = content.replace(/const handleSaveProfile = async[\s\S]*?setIsEditing\(false\);\n  };\n/g, '');
content = content.replace(/const handleSearchMovieForDiary = async[\s\S]*?};\n/g, '');
content = content.replace(/const handleSaveNewDiaryEntry = async[\s\S]*?};\n/g, '');
content = content.replace(/const handleUpgrade = async[\s\S]*?};\n/g, '');
content = content.replace(/const handleFileChange = [\s\S]*?};\n/g, '');

// Strip the editing UI wrappers `{!isEditing ? (` and the corresponding false branch `) : (` 
// Wait, regex might be tricky. Let's just output the file and write a simpler regex.

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
