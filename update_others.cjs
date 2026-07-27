const fs = require('fs');

// Search.tsx
let searchCode = fs.readFileSync('src/pages/Search.tsx', 'utf8');
searchCode = searchCode.replace(/import hentaiAnime from '\.\.\/lib\/hentai\.json';\n/, '');
searchCode = searchCode.replace(/const hentaiResults = lowercaseQuery === 'hentai' \? hentaiAnime\.map\(\(h: any\) => \(\{ \.\.\.h, isHentai: true \}\)\) : hentaiAnime\s*\.filter\(\(h: any\) => \(\(h\.title \|\| h\.name\) \?\? ''\)\.toLowerCase\(\)\.includes\(lowercaseQuery\)\)\s*\.map\(\(h: any\) => \(\{ \.\.\.h, isHentai: true \}\)\);\s*setResults\(\[\.\.\.\(movieRes\.results \|\| \[\]\), \.\.\.hentaiResults\]\);/, 'setResults(movieRes.results || []);');
fs.writeFileSync('src/pages/Search.tsx', searchCode);

// MovieDetails.tsx
let detailsCode = fs.readFileSync('src/pages/MovieDetails.tsx', 'utf8');
detailsCode = detailsCode.replace(/import hentaiAnime from '\.\.\/lib\/hentai\.json';\n/, '');
detailsCode = detailsCode.replace(/const isHentai = hentaiAnime\.some\(h => String\(h\.id\) === String\(id\)\) \|\| searchParams\.get\('isHentai'\) === 'true';\s*if \(isHentai\) {\s*\/\/ For hentai, fetch images directly via our proxy with include_adult=true or similar\.\s*const imagesRes = await fetchFromTmdb\(`\/\$\{mediaType\}\/\$\{id\}\/images\?include_adult=true`\);\s*if \(imagesRes && imagesRes\.backdrops && imagesRes\.backdrops\.length > 0\) {\s*let bgPath = imagesRes\.backdrops\[0\]\.file_path;\s*const userCustomBg = localStorage\.getItem\(`custom_bg_\$\{id\}`\);\s*if \(userCustomBg\) bgPath = userCustomBg;\s*setDetails\(\(prev: any\) => \(\{ \.\.\.prev, backdrop_path: bgPath, images: imagesRes \}\)\);\s*setUserBg\(userCustomBg \|\| null\);\s*}\s*}\n/g, '');
detailsCode = detailsCode.replace(/<button\s*onClick={handleCustomBgClick}\s*className="px-3 py-1\.5 bg-white\/10 hover:bg-white\/20 text-white\/70 hover:text-white text-xs font-bold rounded flex items-center gap-2 transition-colors"\s*>\s*<Image className="w-3 h-3" \/> Change Poster\s*<\/button>/g, '');
detailsCode = detailsCode.replace(/<input\s*type="file"\s*ref={fileInputRef}\s*className="hidden"\s*accept="image\/\*"\s*onChange={handleFileUpload}\s*\/>/g, '');
detailsCode = detailsCode.replace(/const fileInputRef = useRef<HTMLInputElement>\(null\);\s*const \[userBg, setUserBg\] = useState<string \| null>\(null\);\s*const handleCustomBgClick = \(\) => {\s*fileInputRef\.current\?\.click\(\);\s*};\s*const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => {\s*const file = e\.target\.files\?\.\[0\];\s*if \(file\) {\s*const reader = new FileReader\(\);\s*reader\.onloadend = \(\) => {\s*const base64 = reader\.result as string;\s*localStorage\.setItem\(`custom_bg_\$\{id\}`\, base64\);\s*setUserBg\(base64\);\s*setDetails\(\(prev: any\) => \(\{ \.\.\.prev, backdrop_path: base64 \}\)\);\s*};\s*reader\.readAsDataURL\(file\);\s*}\s*};\n/g, '');


fs.writeFileSync('src/pages/MovieDetails.tsx', detailsCode);

