import fs from 'fs';

const animes = [
"Attack on Titan", "Berserk", "Bleach", "Cowboy Bebop", "Death Note", "Demon Slayer", "Dragon Ball", "Haikyu!!", "Hunter × Hunter", "Jujutsu Kaisen", "My Hero Academia", "Naruto", "Naruto: Shippuden", "One Piece", "Pokémon",
"Adventure Kid", "Akiba Girls", "Alien from the Darkness", "Angel", "Angel Blade", "Bible Black", "Boku no Pico", "Bondage Mansion", "Campus", "Call Me Tonight", "Cool Devices", "Dark Shell", "Demon Beast Invasion", "Dragon Knight", "Elven Bride", "Enzai", "Fencer of Minerva", "Futari Ecchi", "G-Taste", "Girl Next Door", "Green Green", "Harukoi Otome", "Hatsuinu", "I Dream of Mimi", "Imouto Paradise!", "Imouto Paradise 2", "Jiburiru", "Kama Sutra", "Kanojo × Kanojo × Kanojo", "Kite", "La Blue Girl", "Level C", "Lolita Anime", "Magic Woman M", "Magical Canan", "Magical Twilight", "Maple Colors", "MeiKing", "Mezzo Forte", "Midnight Panther", "Milk Money", "Mizuiro", "Moonlight Lady", "Night Shift Nurses", "No Money", "Ogenki Clinic", "Papillon Rose", "Prism Ark", "Private Psycho Lesson", "Rei Rei", "Sensitive Pornograph", "Sexy Sailor Soldiers", "Slave Doll", "Sora no Iro, Mizu no Iro", "Stepmother's Sin", "Steal Moon", "Taboo Charming Mother", "The Rapeman", "Tournament of the Gods", "Urotsukidoji", "Venus 5", "Vixens", "Welcome to Pia Carrot", "Women at Work", "Words Worth"
];

async function run() {
  const results = [];
  for (const query of animes) {
    try {
      // First try TV
      const resTv = await fetch(`http://localhost:3000/api/tmdb/search/tv?query=${encodeURIComponent(query)}&include_adult=true`);
      const dataTv = await resTv.json();
      if (dataTv.results && dataTv.results.length > 0) {
        results.push(dataTv.results[0]);
        continue;
      }
      
      // Then try Movie
      const resMovie = await fetch(`http://localhost:3000/api/tmdb/search/movie?query=${encodeURIComponent(query)}&include_adult=true`);
      const dataMovie = await resMovie.json();
      if (dataMovie.results && dataMovie.results.length > 0) {
        results.push(dataMovie.results[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  fs.writeFileSync('src/lib/animeData.json', JSON.stringify(results, null, 2));
  console.log("Done fetching", results.length, "animes");
}
run();
