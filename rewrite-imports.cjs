const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  if (file.endsWith('firebase.ts') || file.endsWith('firestore-wrapper.ts')) return;

  let content = fs.readFileSync(file, 'utf8');
  
  // Need to calculate relative path to src/lib/firestore-wrapper
  const fileDir = path.dirname(file);
  const targetDir = 'src/lib';
  let relativePath = path.relative(fileDir, targetDir);
  if (relativePath === '') relativePath = '.';
  let newImportPath = relativePath + '/firestore-wrapper';
  if (!newImportPath.startsWith('.')) {
    newImportPath = './' + newImportPath;
  }
  
  // Replace import { ... } from 'firebase/firestore'
  // Or import { ... } from "firebase/firestore"
  if (content.includes('firebase/firestore')) {
    content = content.replace(/['"]firebase\/firestore['"]/g, `'${newImportPath}'`);
    fs.writeFileSync(file, content);
  }
});
