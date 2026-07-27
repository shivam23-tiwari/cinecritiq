const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewsSection.tsx', 'utf8');

code = code.replace(/review\.userName/g, "(review.userId === user?.uid && userData?.displayName ? userData.displayName : review.userName)");
fs.writeFileSync('src/components/ReviewsSection.tsx', code);
