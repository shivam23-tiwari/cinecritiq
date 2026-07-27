const fs = require('fs');
const html = fs.readFileSync('page_body.html', 'utf8');
console.log("Root content:", html.substring(html.indexOf('<div id="root">'), html.indexOf('<div id="root">') + 200));
