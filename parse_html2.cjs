const fs = require('fs');
const html = fs.readFileSync('page_body.html', 'utf8');
if (html.includes('Popular TV Series')) console.log('Popular TV Series found!');
if (html.includes('Only on Netflix')) console.log('Only on Netflix found!');
if (html.includes('Upcoming Best Movies')) console.log('Upcoming Best Movies found!');
