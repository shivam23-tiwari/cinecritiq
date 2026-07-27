import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

content = content.replace(/const \{ user: currentUser, authLoading: authLoading, customPosters \} = useAuth\(\);/, 'const { user: currentUser, loading: authLoading, customPosters } = useAuth();');

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
