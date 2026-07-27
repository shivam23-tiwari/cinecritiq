import fs from 'fs';

let content = fs.readFileSync('src/pages/PublicProfile.tsx', 'utf8');

// remove duplicate followersCount
let dupFollowersRegex = /const \[followersCount, setFollowersCount\] = useState\(0\);\n  const \[followingCount, setFollowingCount\] = useState\(0\);/g;
let matches = [...content.matchAll(dupFollowersRegex)];
if (matches.length > 1) {
  content = content.replace(matches[1][0], '');
}

// remove handleSaveNewDiaryEntry
let diarySaveRegex = /const handleSaveNewDiaryEntry = async \(\) => {[\s\S]*?setIsSavingDiary\(false\);\n    }\n  };/g;
content = content.replace(diarySaveRegex, '');

// remove handleSearchMovieForDiary
let diarySearchRegex = /const handleSearchMovieForDiary = async \(e: React\.FormEvent\) => {[\s\S]*?setIsSearchingDiary\(false\);\n    }\n  };/g;
content = content.replace(diarySearchRegex, '');

fs.writeFileSync('src/pages/PublicProfile.tsx', content);
