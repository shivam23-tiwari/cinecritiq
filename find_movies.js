const fetch = require('node-fetch');

async function find() {
  const res = await fetch('http://localhost:3000/api/tmdb/movie/popular');
  const data = await res.json();
  data.results.forEach(m => {
    if (m.title.includes("Furious") || m.title.includes("Evil")) {
      console.log(m.id, m.title);
    }
  });
}
find();
