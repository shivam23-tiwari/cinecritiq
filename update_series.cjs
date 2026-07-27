const fs = require('fs');
let content = fs.readFileSync('src/pages/Series.tsx', 'utf8');

content = content.replace(
  'const fetchData = async () => {\n      try {\n        const [\n          pop1, pop2,',
  `const fetchData = async () => {
      try {
        const bestSeriesIds = [1399, 94997, 37680, 1396, 66732, 76479, 60574, 2316, 76331, 100088, 1398, 1402, 60059, 87108, 93405, 42009];
        const [
          bestSeriesRes,
          pop1, pop2,`
);

content = content.replace(
  `] = await Promise.all([\n          fetchFromTmdb("/tv/popular", { page: "1" }),`,
  `] = await Promise.all([
          Promise.all(bestSeriesIds.map(id => fetchFromTmdb(\`/tv/\${id}\`).catch(() => null))),
          fetchFromTmdb("/tv/popular", { page: "1" }),`
);

content = content.replace(
  'setPopular(combine(pop1, pop2)); cachedPopular = combine(pop1, pop2);',
  `const validBest = bestSeriesRes.filter(Boolean);
        const combinedPop = combine(pop1, pop2);
        const finalPopular = [...validBest, ...combinedPop].filter((item, index, self) => self.findIndex(t => t.id === item.id) === index);

        setPopular(finalPopular); cachedPopular = finalPopular;`
);

content = content.replace('Popular TV Series', 'Popular Series');

fs.writeFileSync('src/pages/Series.tsx', content);
