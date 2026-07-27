import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

// Find the premium modal
let premiumModalStart = content.indexOf('{showPremiumModal && (');
if (premiumModalStart === -1) premiumModalStart = content.indexOf('      {/* Premium Upgrade Modal */}');

if (premiumModalStart !== -1) {
  let isEditingStart = content.indexOf('      {!isEditing ? (');
  if (isEditingStart !== -1) {
     content = content.substring(0, premiumModalStart) + content.substring(isEditingStart);
  }
}

// Remove the `{!isEditing ? (` and the corresponding closing bracket.
content = content.replace('      {!isEditing ? (', '');
let isEditingEndIdx = content.indexOf('      ) : (');
if (isEditingEndIdx !== -1) {
   content = content.substring(0, isEditingEndIdx) + '\n';
}

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
