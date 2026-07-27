const fs = require('fs');
const content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const oldSaveStatus = `      setSavingStatus('success');
      setTimeout(() => {
        setSavingStatus('idle');
        setIsEditing(false);
      }, 500);`;

const newSaveStatus = `      setSavingStatus('success');
      setSavingStatus('idle');
      setIsEditing(false);`;

const newContent = content.replace(oldSaveStatus, newSaveStatus);
fs.writeFileSync('src/pages/Profile.tsx', newContent);
