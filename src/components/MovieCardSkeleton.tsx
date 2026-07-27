import React from 'react';

export default function MovieCardSkeleton() {
  return (
    <div className="flex flex-col bg-white/5 rounded-lg border border-white/10 overflow-hidden text-left animate-pulse">
      <div className="relative aspect-[2/3] w-full bg-white/10"></div>
      <div className="p-3 bg-neutral-900 flex-grow w-full">
        <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-1/4"></div>
      </div>
    </div>
  );
}
