import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

# Replace sizes in Stream section
content = content.replace("w-[60px] md:w-[80px]", "w-[60px] sm:w-[70px] md:w-[80px] lg:w-[100px]")
content = content.replace("w-14 h-14 md:w-20 md:h-20", "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24")

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)

