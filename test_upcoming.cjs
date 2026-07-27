const axios = require('axios');
axios.get('http://localhost:3000/api/tmdb/movie/upcoming').then(res => {
  console.log(res.data.results.map(r => r.release_date).slice(0, 10));
});
