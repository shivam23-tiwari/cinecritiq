const fs = require('fs');

// Fix AnimePage
let animePage = fs.readFileSync('src/pages/AnimePage.tsx', 'utf8');
animePage = animePage.replace(
  /const \{ userData \} = useAuth\(\);/,
  `const { user, userData, notifyOwner } = useAuth();`
);
fs.writeFileSync('src/pages/AnimePage.tsx', animePage);

// Fix PostsFeed
let postsFeed = fs.readFileSync('src/components/PostsFeed.tsx', 'utf8');
postsFeed = postsFeed.replace(
  /function PostCard\(\{ post, currentUser, onDelete \}: \{ post: Post, currentUser: any, onDelete: \(\) => void \}\) \{/,
  `function PostCard({ post, currentUser, onDelete }: { post: Post, currentUser: any, onDelete: () => void }) {\n  const { userData } = useAuth();`
);
fs.writeFileSync('src/components/PostsFeed.tsx', postsFeed);

// Fix AuthContext
let authContext = fs.readFileSync('src/lib/AuthContext.tsx', 'utf8');
authContext = authContext.replace(
  /isPremium\?: boolean;/,
  `isPremium?: boolean;\n  hentaiAccess?: boolean;`
);
fs.writeFileSync('src/lib/AuthContext.tsx', authContext);

// Fix MovieDetails
let movieDetails = fs.readFileSync('src/pages/MovieDetails.tsx', 'utf8');
movieDetails = movieDetails.replace(
  /TrendingUp\n\} from "lucide-react";/,
  `TrendingUp,\n  Maximize2,\n  ChevronLeft,\n  ChevronRight\n} from "lucide-react";`
);
fs.writeFileSync('src/pages/MovieDetails.tsx', movieDetails);

console.log("Fixes applied");
