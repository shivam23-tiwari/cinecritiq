import re

with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

# Replace flex-col with flex-row
content = content.replace('className="flex flex-col md:flex-row items-center gap-6 mb-12 p-4 md:p-8 bg-black/40 rounded-xl border border-white/5 relative shadow-xl"', 'className="flex flex-row items-center gap-4 md:gap-6 mb-12 p-4 md:p-8 bg-black/40 rounded-xl border border-white/5 relative shadow-xl"')

# Fix child flex-col md:flex-row to flex-wrap
content = content.replace('className="flex flex-col md:flex-row items-center gap-3 mb-2"', 'className="flex flex-wrap items-center gap-2 md:gap-3 mb-2"')

# Fix text-center md:text-left to text-left
content = content.replace('className="text-center md:text-left flex-1"', 'className="text-left flex-1"')

# Fix justify-center md:justify-start to justify-start
content = content.replace('justify-center md:justify-start', 'justify-start')

# Fix text-base to text-sm md:text-base
content = content.replace('text-white/60 text-base', 'text-white/60 text-xs md:text-base')
content = content.replace('text-[#E1306C] text-base font-medium', 'text-[#E1306C] text-xs md:text-base font-medium')

# Fix followers row gap on mobile
content = content.replace('gap-4 mt-2', 'gap-2 md:gap-4 mt-2')
content = content.replace('text-sm', 'text-xs md:text-sm')

# Make "Reset Posters" smaller on mobile and position it safely
content = content.replace('absolute top-16 right-4 md:top-4 md:right-16 px-4 py-2 bg-red-600', 'absolute top-12 right-2 md:top-4 md:right-16 px-2 md:px-4 py-1 md:py-2 text-[10px] md:text-sm bg-red-600')

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(content)
