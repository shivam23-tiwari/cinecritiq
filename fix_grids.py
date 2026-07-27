import os
import glob

files = glob.glob('src/pages/*.tsx')

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Update Movie grids
    if 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' in content:
        content = content.replace('grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6', 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7')
    
    # Update gaps
    if 'gap-5' in content and 'grid ' in content:
        # replace gap-5 with gap-3 sm:gap-4 md:gap-5 in grid containers
        content = content.replace('gap-5', 'gap-3 sm:gap-4 md:gap-5')

    with open(file, 'w') as f:
        f.write(content)

print("Grids updated")
