const animeData = require('./src/lib/animeData.json');
const filtered = animeData.filter(a => a.original_language === 'ja');
console.log(animeData.length, filtered.length);
