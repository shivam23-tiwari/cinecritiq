import re

with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

old_func = """  const handleSaveTmdbPoster = async (posterPath: string) => {
    console.log("Saving custom poster:", posterPath, id, user?.uid);
    if (!user) {
      alert("Please login first to change posters.");
      return;
    }
    if (!id) return;
    try {
      if (!posterPath) {
        setOptimisticPoster("reset");
        const actionRef = doc(db, 'users', user.uid, 'movieActions', `customPoster_${id}`);
        await deleteDoc(actionRef);
        console.log("Deleted custom poster");
      } else {
        const fullUrl = getImageUrl(posterPath, "w500");
        setOptimisticPoster(fullUrl);
        console.log("Full URL:", fullUrl);
        const actionRef = doc(db, 'users', user.uid, 'movieActions', `customPoster_${id}`);
        await setDoc(actionRef, { 
          movieId: id,
          actionType: 'customPoster', 
          url: fullUrl,
          customPosterUrl: fullUrl,
          userId: user.uid, 
          createdAt: serverTimestamp(),
          movieData: {
            id: id,
            title: movie?.title || movie?.name || '',
            poster_path: movie?.poster_path || '',
            backdrop_path: movie?.backdrop_path || ''
          }
        });
        console.log("Saved custom poster successfully");
      }
      setShowCustomPosterModal(false);
    } catch (error: any) {
      console.error("Error saving custom poster:", error);
      alert("Failed to save custom poster: " + error.message);
    }
  };"""

new_func = """  const handleSaveTmdbPoster = async (posterPath: string) => {
    console.log("Saving custom poster:", posterPath, id, user?.uid);
    if (!id) return;
    try {
      if (!posterPath) {
        setOptimisticPoster("reset");
        if (user) {
          const actionRef = doc(db, 'users', user.uid, 'movieActions', `customPoster_${id}`);
          await deleteDoc(actionRef);
        } else {
          const localPosters = JSON.parse(localStorage.getItem('customPosters') || '{}');
          delete localPosters[id];
          localStorage.setItem('customPosters', JSON.stringify(localPosters));
          window.dispatchEvent(new Event('localPostersChanged'));
        }
        console.log("Deleted custom poster");
      } else {
        const fullUrl = getImageUrl(posterPath, "w500");
        setOptimisticPoster(fullUrl);
        console.log("Full URL:", fullUrl);
        if (user) {
          const actionRef = doc(db, 'users', user.uid, 'movieActions', `customPoster_${id}`);
          await setDoc(actionRef, { 
            movieId: id,
            actionType: 'customPoster', 
            url: fullUrl,
            customPosterUrl: fullUrl,
            userId: user.uid, 
            createdAt: serverTimestamp(),
            movieData: {
              id: id,
              title: movie?.title || movie?.name || '',
              poster_path: movie?.poster_path || '',
              backdrop_path: movie?.backdrop_path || ''
            }
          });
        } else {
          const localPosters = JSON.parse(localStorage.getItem('customPosters') || '{}');
          localPosters[id] = fullUrl;
          localStorage.setItem('customPosters', JSON.stringify(localPosters));
          window.dispatchEvent(new Event('localPostersChanged'));
        }
        console.log("Saved custom poster successfully");
      }
      setShowCustomPosterModal(false);
    } catch (error: any) {
      console.error("Error saving custom poster:", error);
      alert("Failed to save custom poster: " + error.message);
    }
  };"""

if old_func in content:
    content = content.replace(old_func, new_func)
    with open('src/pages/MovieDetails.tsx', 'w') as f:
        f.write(content)
    print("Successfully replaced.")
else:
    print("Could not find the function to replace.")

