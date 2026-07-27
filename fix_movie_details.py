with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

to_remove = """  const getActivePoster = () => {
    if (optimisticPoster === "reset") return null;
    if (optimisticPoster) return optimisticPoster;
    return customPosters?.[id || ""];
  };
  const activePoster = getActivePoster();
"""

content = content.replace(to_remove, "")

to_add = """  const [optimisticPoster, setOptimisticPoster] = useState<string | null>(null);
  
  const getActivePoster = () => {
    if (optimisticPoster === "reset") return null;
    if (optimisticPoster) return optimisticPoster;
    return customPosters?.[id || ""];
  };
  const activePoster = getActivePoster();"""

content = content.replace("const [optimisticPoster, setOptimisticPoster] = useState<string | null>(null);", to_add)

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)
