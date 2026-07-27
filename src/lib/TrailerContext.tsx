import React, { createContext, useContext, useState, ReactNode } from 'react';
import TrailerModal from '../components/TrailerModal';

interface TrailerContextType {
  openTrailer: (movieId: number | string, type: 'movie' | 'tv', title?: string, date?: string, videoKey?: string) => void;
  closeTrailer: () => void;
}

const TrailerContext = createContext<TrailerContextType | undefined>(undefined);

export function TrailerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [trailerData, setTrailerData] = useState<{ id: number | string, type: 'movie' | 'tv', title?: string, date?: string, videoKey?: string } | null>(null);

  const openTrailer = (id: number | string, type: 'movie' | 'tv', title?: string, date?: string, videoKey?: string) => {
    setTrailerData({ id, type, title, date, videoKey });
    setIsOpen(true);
  };

  const closeTrailer = () => {
    setIsOpen(false);
  };

  return (
    <TrailerContext.Provider value={{ openTrailer, closeTrailer }}>
      {children}
      <TrailerModal 
        isOpen={isOpen} 
        onClose={closeTrailer} 
        movieId={trailerData?.id || null} 
        type={trailerData?.type || 'movie'}
        movieTitle={trailerData?.title}
        movieDate={trailerData?.date}
        videoKeyOverride={trailerData?.videoKey}
      />
    </TrailerContext.Provider>
  );
}

export function useTrailer() {
  const context = useContext(TrailerContext);
  if (!context) {
    throw new Error('useTrailer must be used within a TrailerProvider');
  }
  return context;
}
