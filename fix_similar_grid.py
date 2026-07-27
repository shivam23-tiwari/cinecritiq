with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5"', 'className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5"')

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)
