const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { fetchFromTmdb } from '../lib/tmdb';
import ReactPlayer from 'react-player';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: string | number | null;
  type?: 'movie' | 'tv';
  movieTitle?: string;
  movieDate?: string;
  videoKeyOverride?: string;
}

export default function TrailerModal({ isOpen, onClose, movieId, type = 'movie', movieTitle, movieDate, videoKeyOverride }: TrailerModalProps) {
  const [videoKeys, setVideoKeys] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen && videoKeyOverride) {
      setVideoKeys([videoKeyOverride]);
      setCurrentIndex(0);
      setLoading(false);
      setHasError(false);
      return;
    }
    
    if (isOpen && movieId) {
      setLoading(true);
      setVideoKeys([]);
      setCurrentIndex(0);
      setHasError(false);
      
      fetchFromTmdb(\`/\${type}/\${movieId}/videos\`)
        .then(data => {
          let keys: string[] = [];
          if (data?.results?.length > 0) {
            const trailers = data.results.filter((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
            const otherVideos = data.results.filter((v: any) => v.site === 'YouTube' && v.type !== 'Trailer');
            keys = [...trailers, ...otherVideos].map((v: any) => v.key);
          }
          
          if (keys.length > 0) {
            setVideoKeys(keys);
            setLoading(false);
          } else {
            // No videos from TMDB, fall straight to search embed
            setHasError(true);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error(err);
          setHasError(true);
          setLoading(false);
        });
    }
  }, [isOpen, movieId, type, videoKeyOverride]);

  const handleVideoError = (e: any) => {
    console.warn("Video failed to play, trying next one if available...", e);
    if (currentIndex < videoKeys.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const currentKey = videoKeys[currentIndex];
  // Determine if we should show the ReactPlayer or the fallback Iframe
  const showPlayer = currentKey && !hasError;
  const showFallback = hasError && movieTitle;

  return (
    <AnimatePresence>
      {isOpen && (movieId || videoKeyOverride || movieTitle) && (
        <motion.div
          key="trailer-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-0 sm:p-8 bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-sm transition-all z-50"
          >
            <X className="w-8 h-8" />
          </button>
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-6xl aspect-[4/3] sm:aspect-video bg-black sm:rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            {loading ? (
               <div className="w-12 h-12 border-4 border-white/20 border-t-[#E50914] rounded-full animate-spin"></div>
            ) : showPlayer ? (
              <div className="w-full h-full relative z-10">
                <ReactPlayer
                  key={currentKey}
                  url={\`https://www.youtube.com/watch?v=\${currentKey}\`}
                  width="100%"
                  height="100%"
                  playing={true}
                  controls={true}
                  onError={handleVideoError}
                  config={{
                    youtube: {
                      playerVars: {
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }}
                  fallback={<div className="w-12 h-12 border-4 border-white/20 border-t-[#E50914] rounded-full animate-spin"></div>}
                />
              </div>
            ) : showFallback ? (
              <div className="w-full h-full relative z-10">
                <iframe
                  key="search-fallback"
                  src={\`https://www.youtube.com/embed?listType=search&list=\${encodeURIComponent(movieTitle + ' official trailer')}&autoplay=1&modestbranding=1&rel=0\`}
                  title="YouTube video player fallback"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-white/60">
                <div className="mb-4">Trailer not available</div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
`;
fs.writeFileSync('src/components/TrailerModal.tsx', code);
