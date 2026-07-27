const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(/let globalBestSeries: any\[\] = \[\];/, 'let globalBestSeries: any[] = [];\nexport let globalPopularSeries: any[] = [];');
code = code.replace(/const \[bestSeries, setBestSeries\] = useState<any\[\]>\(globalBestSeries\);/, 'const [bestSeries, setBestSeries] = useState<any[]>(globalBestSeries);\n  const [popularSeries, setPopularSeries] = useState<any[]>(globalPopularSeries);');

code = code.replace(/setBestSeries\(globalBestSeries\);/, 'setBestSeries(globalBestSeries);\n        setPopularSeries(globalPopularSeries);');

code = code.replace(/bs1, bs2, bs3, bs4, bs5, bs6, bs7/, 'bs1, bs2, bs3, bs4, bs5, bs6, bs7,\n          ps1, ps2, ps3, ps4, ps5');

code = code.replace(/fetchFromTmdb\("\/discover\/tv", \{ with_networks: "213", page: "7" \}\),/, 'fetchFromTmdb("/discover/tv", { with_networks: "213", page: "7" }),\n          fetchFromTmdb("/tv/popular", { page: "1" }),\n          fetchFromTmdb("/tv/popular", { page: "2" }),\n          fetchFromTmdb("/tv/popular", { page: "3" }),\n          fetchFromTmdb("/tv/popular", { page: "4" }),\n          fetchFromTmdb("/tv/popular", { page: "5" }),');

code = code.replace(/const newBestSeries = combine\(bs1, bs2, bs3, bs4, bs5, bs6, bs7\);/, 'const newBestSeries = combine(bs1, bs2, bs3, bs4, bs5, bs6, bs7);\n        const newPopularSeries = combine(ps1, ps2, ps3, ps4, ps5);');

code = code.replace(/globalBestSeries = newBestSeries;/, 'globalBestSeries = newBestSeries;\n        globalPopularSeries = newPopularSeries;');

code = code.replace(/setBestSeries\(newBestSeries\);/, 'setBestSeries(newBestSeries);\n        setPopularSeries(newPopularSeries);');

fs.writeFileSync('src/pages/Home.tsx', code);
