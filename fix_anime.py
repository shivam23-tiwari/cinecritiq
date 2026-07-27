import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Let's just find the end of the Promise.all array and insert it there.
content = re.sub(
    r'(fetchFromTmdb\("/movie/popular", { page: "5" }\),[\s\n]*?)\]\);',
    r'\1          fetchFromTmdb("/discover/tv", { with_genres: "16", with_original_language: "ja", sort_by: "popularity.desc", page: "1" }),\n          fetchFromTmdb("/discover/movie", { with_genres: "16", with_original_language: "ja", sort_by: "popularity.desc", page: "1" }),\n        ]);',
    content
)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)

print("Home.tsx updated with TMDB anime fetch")
