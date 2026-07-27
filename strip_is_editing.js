import fs from 'fs';
let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

// Replace `!isEditing ? (` with nothing
content = content.replace('{!isEditing ? (', '');

// Find `) : (` and cut everything down to the end of the container... wait
// In Profile.tsx, the edit form is inside the `) : (` block.
let editFormStart = content.indexOf(') : (');
if (editFormStart !== -1) {
  // Find where this ternary ends...
  // In Profile.tsx, after the edit form ends, there's `)}` to close the ternary.
  let editFormEnd = content.indexOf(')}', editFormStart);
  if (editFormEnd !== -1) {
    content = content.substring(0, editFormStart) + content.substring(editFormEnd + 2);
  }
}

// Remove showPremiumModal entirely
let premiumStart = content.indexOf('{showPremiumModal && (');
if (premiumStart !== -1) {
  let premiumEnd = content.indexOf('</div>\n        </div>\n      )}', premiumStart);
  if (premiumEnd !== -1) {
    content = content.substring(0, premiumStart) + content.substring(premiumEnd + 34);
  }
}

// Remove showAddDiaryModal entirely
let diaryStart = content.indexOf('{showAddDiaryModal && (');
if (diaryStart !== -1) {
  let diaryEnd = content.indexOf('</div>\n        </div>\n      )}', diaryStart);
  if (diaryEnd !== -1) {
    content = content.substring(0, diaryStart) + content.substring(diaryEnd + 34);
  }
}

// Replace handleFollow inside the UI
let profileDataImage = content.indexOf('profileData.photoURL');
content = content.replace(/profileData\.photoURL/g, "profileUser?.photoURL");
content = content.replace(/profileData\.displayName/g, "profileUser?.displayName");
content = content.replace(/profileData\.instagramUsername/g, "profileUser?.instagramUsername");
content = content.replace(/profileData\.isPremium/g, "profileUser?.isPremium");

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
