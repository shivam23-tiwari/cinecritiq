import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin } from "lucide-react";
import { fetchFromTmdb, getImageUrl } from "../lib/tmdb";
import MovieCard from "./MovieCard";
import { motion, AnimatePresence } from "motion/react";

export default function ActorModal({
  actor,
  onClose,
}: {
  actor: any;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActorDetails = async () => {
      setLoading(true);
      try {
        const [personRes, creditsRes, imagesRes] = await Promise.all([
          fetchFromTmdb(`/person/${actor.id}`),
          fetchFromTmdb(`/person/${actor.id}/movie_credits`),
          fetchFromTmdb(`/person/${actor.id}/images`),
        ]);

        setDetails(personRes);
        setMovies(
          creditsRes?.cast
            ?.sort((a: any, b: any) => b.popularity - a.popularity)
            .slice(0, 12) || [],
        );
        setImages(imagesRes?.profiles?.slice(0, 10) || []);
      } catch (err) {
        console.error("Failed to fetch actor details", err);
      } finally {
        setLoading(false);
      }
    };

    if (actor?.id) {
      fetchActorDetails();
    }
  }, [actor]);

  if (!actor) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-[#111] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-[#38bdf8] rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 min-h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38bdf8]"></div>
            </div>
          ) : (
            <div className="overflow-y-auto scrollbar-hide flex-1">
              <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                <div className="w-40 h-40 md:w-64 md:h-64 rounded-full md:rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 bg-white/5 mx-auto md:mx-0">
                  {details?.profile_path ? (
                    <img
                      src={getImageUrl(details.profile_path, "w500")}
                      alt={details.name}
                      className="w-full h-full object-cover"
                    />
                  ) : actor.profile_path ? (
                    <img
                      src={getImageUrl(actor.profile_path, "w500")}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-neutral-900 px-4 text-center">
                      <span className="font-bold text-white/50">{details?.name || actor.name}</span>
                      <span className="text-xs opacity-50 mt-1">No Image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left pt-2">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-2">
                    {details?.name || actor.name}
                  </h2>
                  <p className="text-gray-400 text-lg mb-6">
                    {details?.known_for_department}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-sm">
                    {details?.birthday && (
                      <div className="flex items-center gap-1 text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
                        <Calendar className="w-4 h-4" /> {details.birthday}
                        {details.deathday && ` - ${details.deathday}`}
                      </div>
                    )}
                    {details?.place_of_birth && (
                      <div className="flex items-center gap-1 text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
                        <MapPin className="w-4 h-4" /> {details.place_of_birth}
                      </div>
                    )}
                  </div>

                  {details?.biography ? (
                    <div>
                      <h3 className="text-white font-bold mb-2">Biography</h3>
                      <p className="text-gray-400 text-sm leading-relaxed max-h-40 overflow-y-auto pr-4 scrollbar-hide">
                        {details.biography}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-white font-bold mb-2">About</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {details?.name || actor.name} is known for their work in the film industry, contributing to various productions in the role of {details?.known_for_department || actor.known_for_department || 'Cast'}.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Photos */}
              {images.length > 1 && (
                <div className="px-8 md:px-10 py-8 border-b border-white/5">
                  <h3 className="text-xl font-bold text-white mb-6">Photos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {images.map((img: any, i: number) => (
                      <div
                        key={i}
                        className="flex-[0_0_120px] md:flex-[0_0_160px] aspect-[2/3] rounded-lg overflow-hidden border border-white/10 bg-white/5 cursor-pointer hover:border-[#38bdf8] transition-colors"
                      >
                        <img
                          src={getImageUrl(img.file_path, "w500")}
                          alt={`${actor.name} ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-8 md:p-10">
                <h3 className="text-xl font-bold text-white mb-6">Known For</h3>
                {movies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movies.map((m: any, _idx: number) => (
                      <div
                        key={`${m.id}-${_idx}`}
                        onClick={() => {
                          window.location.href = `/movie/${m.id}`;
                        }}
                      >
                        <MovieCard movie={m} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 py-4 text-center bg-white/5 rounded-xl border border-white/10">
                    <p>No other known movies found in the database.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
