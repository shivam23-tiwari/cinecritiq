import re

with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

# Fix tabs scrolling
old_tabs = """      {/* Profile Tabs */}
      <div className="mb-8 border-b border-white/10 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-px min-w-max">"""
new_tabs = """      {/* Profile Tabs */}
      <div className="mb-8 border-b border-white/10 overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
        <div className="flex gap-2 pb-px min-w-max">"""
content = content.replace(old_tabs, new_tabs)

# Fix Top 4 layout
old_top4 = """            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 md:gap-4">
              {slots.map(index => {"""
new_top4 = """            <div className="overflow-x-auto scrollbar-hide py-2 -mx-6 px-6 md:mx-0 md:px-0">
              <div className="flex gap-3 md:gap-4" style={{ width: "max-content" }}>
              {slots.map(index => {"""
content = content.replace(old_top4, new_top4)

old_top4_movie = """                    <div key={`top4-${index}`} className="relative group rounded-xl overflow-hidden aspect-[2/3] border border-white/10 hover:border-[#E50914] transition-colors">"""
new_top4_movie = """                    <div key={`top4-${index}`} className="relative group rounded-xl overflow-hidden aspect-[2/3] border border-white/10 hover:border-[#E50914] transition-colors w-[95px] sm:w-[140px] md:w-[180px]">"""
content = content.replace(old_top4_movie, new_top4_movie)

old_top4_empty = """                    <div key={`empty-${index}`} className="flex flex-col items-center justify-center rounded-xl overflow-hidden aspect-[2/3] border border-dashed border-white/20 bg-white/5 text-white/30">"""
new_top4_empty = """                    <div key={`empty-${index}`} className="flex flex-col items-center justify-center rounded-xl overflow-hidden aspect-[2/3] border border-dashed border-white/20 bg-white/5 text-white/30 w-[95px] sm:w-[140px] md:w-[180px]">"""
content = content.replace(old_top4_empty, new_top4_empty)

# Fix Top 4 flex close tags
# Finding the closing divs for Top 4 grid
old_top4_close = """              })}
            </div>
          </div>"""
new_top4_close = """              })}
              </div>
            </div>
          </div>"""
content = content.replace(old_top4_close, new_top4_close)


# Fix renderMovieGrid
old_grid = """        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-4 md:gap-5">"""
new_grid = """        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-4 md:gap-5">"""
content = content.replace(old_grid, new_grid)

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(content)
