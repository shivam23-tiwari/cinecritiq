const fs = require('fs');
const content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const oldSaveStatus = `      setSavingStatus('success');
      setTimeout(() => {
        setSavingStatus('idle');
        setIsEditing(false);
      }, 1500);`;

const newSaveStatus = `      setSavingStatus('success');
      setTimeout(() => {
        setSavingStatus('idle');
        setIsEditing(false);
      }, 500);`;

const newContent = content.replace(oldSaveStatus, newSaveStatus);
fs.writeFileSync('src/pages/Profile.tsx', newContent);
