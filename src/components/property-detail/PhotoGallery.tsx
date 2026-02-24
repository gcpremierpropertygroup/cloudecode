"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PropertyPhoto } from "@/types/property";

export default function PhotoGallery({
  photos,
}: {
  photos: PropertyPhoto[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="h-[400px] md:h-[500px] bg-[#1F2937] flex items-center justify-center">
        <p className="font-serif text-white/30 text-xl">
          Photos coming soon
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px]">
        {/* Main image */}
        <div
          className="md:col-span-2 md:row-span-2 relative cursor-pointer overflow-hidden bg-[#374151] group"
          onClick={() => setLightboxIndex(0)}
        >
          <Image
            src={photos[0].full}
            alt={photos[0].caption || "Property photo"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Secondary images */}
        {photos.slice(1, 5).map((photo, i) => (
          <div
            key={photo.id}
            className="relative cursor-pointer overflow-hidden bg-[#374151] group hidden md:block"
            onClick={() => setLightboxIndex(i + 1)}
          >
            <Image
              src={photo.full}
              alt={photo.caption || "Property photo"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            {/* "Show all" overlay on last thumbnail */}
            {i === 3 && photos.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  +{photos.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white z-10"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={32} />
            </button>

            {lightboxIndex > 0 && (
              <button
                className="absolute left-6 text-white/70 hover:text-white z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
              >
                <ChevronLeft size={40} />
              </button>
            )}

            {lightboxIndex < photos.length - 1 && (
              <button
                className="absolute right-6 text-white/70 hover:text-white z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
              >
                <ChevronRight size={40} />
              </button>
            )}

            <div
              className="relative w-full max-w-4xl h-[80vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[lightboxIndex].full}
                alt={photos[lightboxIndex].caption || "Property photo"}
                fill
                className="object-contain"
                sizes="100vw"
              />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/60 text-sm">
                  {photos[lightboxIndex].caption && (
                    <span className="mr-3">{photos[lightboxIndex].caption}</span>
                  )}
                  {lightboxIndex + 1} / {photos.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
