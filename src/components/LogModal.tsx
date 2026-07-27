import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Film, Calendar, Star } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { addDoc, collection, serverTimestamp } from '../lib/firestore-wrapper';
import { db } from '../lib/firebase';
import { fetchFromTmdb, getImageUrl } from '../lib/tmdb';

export default function LogModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, userData } = useAuth();
  const [movieName, setMovieName] = useState('');
  const [date, setDate] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [movieSearchResults, setMovieSearchResults] = useState<any[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user ? user.uid : null;
    if (prevUserIdRef.current !== currentUserId || !isOpen) {
      setMovieName('');
      setDate('');
      setRating(0);
      setReview('');
      setFile(null);
      setPreview(null);
      setSelectedMovieId(null);
      setMovieSearchResults([]);
      prevUserIdRef.current = currentUserId;
    }
  }, [isOpen, user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (movieName.trim().length > 2 && !selectedMovieId) {
        try {
          const res = await fetchFromTmdb('/search/multi', { query: movieName, include_adult: 'false' });
          setMovieSearchResults((res.results || []).filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv'));
        } catch (error) {
          console.error(error);
        }
      } else {
        setMovieSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [movieName, selectedMovieId]);

  if (!isOpen) return null;

  const handleMovieSelect = (m: any) => {
    setMovieName(m.title || m.name);
    setSelectedMovieId(m.id);
    setMovieSearchResults([]);
    
    // Auto-suggest photo if available
    if (m.backdrop_path) {
      setPreview(getImageUrl(m.backdrop_path, 'w1280'));
    } else if (m.poster_path) {
      setPreview(getImageUrl(m.poster_path, 'w500'));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPreview(compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(selected);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !movieName) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: userData?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`,
        type: 'log',
        movieName,
        date: date || new Date().toISOString().split('T')[0],
        rating,
        review,
        hasFile: !!file || !!preview,
        fileData: preview || null,
        createdAt: serverTimestamp(),
      });
      onClose();
      setMovieName('');
      setDate('');
      setRating(0);
      setReview('');
      setFile(null);
      setPreview(null);
      setSelectedMovieId(null);
    } catch (error) {
      console.error("Error adding log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#141414] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-[#00E054]" />
              I Watched...
            </h2>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Name of Film</label>
              <div className="relative">
                {selectedMovieId ? (
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <span className="text-[#38bdf8] font-medium bg-[#38bdf8]/10 px-2 py-1 rounded">@{movieName}</span>
                    <button type="button" onClick={() => { setSelectedMovieId(null); setMovieName(''); setPreview(null); }} className="ml-auto text-white/50 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      value={movieName}
                      onChange={(e) => { setMovieName(e.target.value); setSelectedMovieId(null); }}
                      placeholder="Search for a film..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00E054] transition-colors"
                      required
                    />
                    {movieSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[#1c2430] border border-white/10 rounded-lg max-h-60 overflow-y-auto shadow-2xl">
                        {movieSearchResults.map((item: any, _idx: number) => (
                          <div
                            key={`${item.id}-${_idx}`}
                            className="p-2 flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors"
                            onClick={() => handleMovieSelect(item)}
                          >
                            <img referrerPolicy="no-referrer" src={item.poster_path ? getImageUrl(item.poster_path, 'w200') : `https://via.placeholder.com/200x300`} className="w-10 h-14 object-cover rounded" alt="Poster" />
                            <div>
                              <p className="text-white font-medium">{item.title || item.name}</p>
                              <p className="text-white/50 text-xs">{item.release_date || item.first_air_date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00E054] transition-colors"
                  />
                  <Calendar className="w-4 h-4 text-white/40 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Rating</label>
                <div className="flex items-center gap-1 h-12 bg-white/5 border border-white/10 rounded-lg px-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? 'text-[#00E054] fill-[#00E054]' : 'text-white/20 hover:text-white/40'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Review / Notes</label>
              <textarea 
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Add your thoughts..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#00E054] transition-colors min-h-[100px] resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Add Files/Photos</label>
              {preview ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 mb-2">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-lg p-4 cursor-pointer transition-colors text-white/70 hover:text-white">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">Choose a photo/file</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !movieName}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#00E054] hover:bg-[#00c94b] text-black transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Log'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
