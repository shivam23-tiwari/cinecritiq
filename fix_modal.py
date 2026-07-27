with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

content = content.replace('console.log("Saved custom poster successfully");\n      }', 'console.log("Saved custom poster successfully");\n      }\n      setShowCustomPosterModal(false);')

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)
