const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

code = code.replace(
  /import App from '\.\/App\.tsx';\nimport \{ ErrorBoundary \} from '\.\/components\/ErrorBoundary\.tsx';/,
  `import App from './App.tsx';`
);

code = code.replace(
  /<ErrorBoundary><App \/><\/ErrorBoundary>/,
  `<App />`
);

fs.writeFileSync('src/main.tsx', code);
