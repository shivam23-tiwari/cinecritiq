import os

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

content = content.replace('''onClick={(e) => {
    e.stopPropagation();
    handleSaveTmdbPoster(poster.file_path);
  }}''', '''onClick={() => handleSaveTmdbPoster(poster.file_path)}''')

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)

print("MovieDetails click updated")
