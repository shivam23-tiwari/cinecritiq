import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

# Fix the main container
content = content.replace(
    '<div className="flex flex-row-reverse md:flex-row gap-4 md:gap-8 items-start md:items-start justify-between md:justify-start">',
    '<div className="block md:flex flex-row md:flex-row gap-4 md:gap-8 items-start md:items-start justify-between md:justify-start after:content-[\'\'] after:table after:clear-both">'
)

# Fix the poster container
content = content.replace(
    'className="flex flex-col w-28 md:w-48 lg:w-[17rem] flex-shrink-0 relative group"',
    'className="flex flex-col w-28 md:w-48 lg:w-[17rem] flex-shrink-0 relative group float-right md:float-none ml-4 mb-2 md:ml-0 md:mb-0"'
)

# Fix the content container
content = content.replace(
    'className="flex-1 mt-0 md:-mt-2"',
    'className="md:flex-1 mt-0 md:-mt-2"'
)

# Make the title wrap properly around the poster
content = content.replace(
    'className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "Inter, sans-serif" }}>',
    'className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white mb-2 md:mb-4 tracking-tight break-words pr-2" style={{ fontFamily: "Inter, sans-serif" }}>'
)

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)
