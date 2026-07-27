import re

with open('src/pages/Games.tsx', 'r') as f:
    content = f.read()

# Replace main mode selection grid
content = content.replace(
    'className="grid md:grid-cols-2 gap-6"',
    'className="grid sm:grid-cols-2 gap-4 md:gap-6"'
)

# Replace the inner padding for the mode cards
content = content.replace(
    'className="bg-black/20 backdrop-blur-lg border border-white/10 hover:border-[#E50914] p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 group relative overflow-hidden"',
    'className="bg-black/20 backdrop-blur-lg border border-white/10 hover:border-[#E50914] p-5 md:p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 group relative overflow-hidden"'
)

content = content.replace(
    'className="bg-black/20 backdrop-blur-lg border border-white/10 hover:border-yellow-500/50 p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] group relative"',
    'className="bg-black/20 backdrop-blur-lg border border-white/10 hover:border-yellow-500/50 p-5 md:p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] group relative"'
)

# Reduce text sizes on mobile
content = content.replace(
    'className="text-2xl font-bold text-white mb-2 group-hover:text-[#E50914] transition-colors"',
    'className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-[#E50914] transition-colors"'
)
content = content.replace(
    'className="text-gray-400"',
    'className="text-xs md:text-base text-gray-400"'
)

# For Quiz mode buttons
content = content.replace(
    'className="w-full text-left bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/30 p-4 rounded-xl text-white font-medium transition-all"',
    'className="w-full text-left bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/30 p-3 md:p-4 rounded-xl text-sm md:text-base text-white font-medium transition-all"'
)

with open('src/pages/Games.tsx', 'w') as f:
    f.write(content)
