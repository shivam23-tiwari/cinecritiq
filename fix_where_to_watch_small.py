import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

# Replace sizes in Stream section
content = content.replace("w-[60px] sm:w-[70px] md:w-[80px] lg:w-[100px]", "w-16 md:w-20")
content = content.replace("w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl shadow-lg", "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-md")
content = content.replace("gap-6 md:gap-10", "gap-4 md:gap-6")
content = content.replace("space-y-10 md:space-y-12", "space-y-8 md:space-y-10")
content = content.replace("h3 className=\"text-sm md:text-base text-gray-400 uppercase tracking-wider mb-6\"", "h3 className=\"text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-4\"")
content = content.replace("h2 className=\"text-xl md:text-2xl font-bold text-white mb-8 md:mb-12\"", "h2 className=\"text-lg md:text-xl font-bold text-white mb-6 md:mb-8\"")
content = content.replace("pt-16 md:pt-24 pb-8 border-t border-white/5 mt-8 md:mt-12", "pt-10 md:pt-16 pb-8 border-t border-white/5 mt-6 md:mt-8")
content = content.replace("text-[10px] md:text-xs text-gray-400 text-center truncate w-full", "text-[10px] md:text-[11px] text-gray-400 text-center truncate w-full")

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)

