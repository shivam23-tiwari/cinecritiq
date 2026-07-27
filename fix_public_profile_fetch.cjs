const fs = require('fs');
const content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

const oldFetch = `            setUserPosts(combined);
         } catch (e) {
            console.error("Failed to fetch posts/logs", e);
         }
      };`;
const newFetch = `            setUserPostsCount(combined.length);
         } catch (e) {
            console.error("Failed to fetch posts/logs", e);
         }
      };`;

let newContent = content.replace(oldFetch, newFetch);
fs.writeFileSync('src/pages/PublicProfile.tsx', newContent);
