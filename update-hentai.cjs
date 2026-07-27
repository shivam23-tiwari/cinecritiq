const fs = require('fs');

async function updateHentai() {
  const ids = [241002, 220118, 113360, 212568];
  const tmdbUrl = 'http://localhost:3000/api/tmdb'; // Use the proxy or just direct? We are in node, so we need to use fetch. Wait, the proxy requires server running.
  
  const results = [];
  for (const id of ids) {
    try {
      const res = await fetch(`http://localhost:3000/api/tmdb/tv/${id}`);
      const data = await res.json();
      if (data && data.id) {
        results.push(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const existing = JSON.parse(fs.readFileSync('src/lib/hentai.json', 'utf8'));
  const newHentai = [...existing, ...results];
  // remove duplicates
  const uniqueHentai = Array.from(new Map(newHentai.map(item => [item.id, item])).values());
  fs.writeFileSync('src/lib/hentai.json', JSON.stringify(uniqueHentai, null, 2));
  console.log('Updated hentai.json');
}

updateHentai();
