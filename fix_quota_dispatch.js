import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync(path.join(__dirname, 'src')).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We want to change:
  // if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) {
  //   console.error(e);
  // }
  // to:
  // if (!String(e).includes('Quota limit exceeded') && !(e?.message || "").includes('Quota limit exceeded')) {
  //   console.error(e);
  // } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }

  content = content.replace(/if \(!([a-zA-Z0-9_\.\?\(\)\|"'\s]+)includes\('Quota limit exceeded'\) && !\(([a-zA-Z0-9_\.\?\(\)\|"'\s]+)\)\.includes\('Quota limit exceeded'\)\) \{\n(.*?)console\.error\((.*?)\);\n\s*\}/gs, (match) => {
    return match + ' else { window.dispatchEvent(new CustomEvent(\'firebase-quota-exceeded\')); }';
  });

  content = content.replace(/if \(!([a-zA-Z0-9_\.\?\(\)\|"'\s]+)includes\('Quota limit exceeded'\) && !\(([a-zA-Z0-9_\.\?\(\)\|"'\s]+)\)\.includes\('Quota limit exceeded'\)\) console\.error\((.*?)\);/g, (match) => {
    return match + ' else { window.dispatchEvent(new CustomEvent(\'firebase-quota-exceeded\')); }';
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
