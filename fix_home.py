import os

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="w-[150px] sm:w-[200px] md:w-[220px]"', 'className="w-[110px] sm:w-[160px] md:w-[200px] lg:w-[220px]"')
content = content.replace('className="flex gap-5"', 'className="flex gap-3 md:gap-5"')

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)

print("Home updated")
