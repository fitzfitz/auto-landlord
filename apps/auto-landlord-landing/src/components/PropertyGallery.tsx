"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Maximize2, Home } from "lucide-react";
import { getImageUrl } from "@/lib/api";

interface PropertyImage {
  id: string;
  url: string;
  order: number;
}

interface PropertyGalleryProps {
  images: PropertyImage[];
  address: string;
}

export function PropertyGallery({ images, address }: PropertyGalleryProps) {
  const [index, setIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center flex-col text-slate-400 border border-slate-200">
        <Home className="w-16 h-16 mb-2 opacity-50" />
        <p className="font-medium">No images available</p>
      </div>
    );
  }

  const currentImage = images[index];
  const hasMultiple = images.length > 1;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div 
        className="relative aspect-video w-full bg-slate-100 rounded-2xl overflow-hidden group cursor-zoom-in border border-slate-200 shadow-sm"
        onClick={() => setIsLightboxOpen(true)}
      >
        <Image
          src={getImageUrl(currentImage.url)}
          alt={`${address} - Image ${index + 1}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        
        {/* Expand Icon */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Maximize2 className="w-5 h-5 text-slate-700" />
        </div>

        {/* Navigation Buttons (Inline) */}
        {hasMultiple && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-slate-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
          </>
        )}

        {/* Image Counter Badge */}
        {hasMultiple && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
            {index + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {hasMultiple && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                i === index 
                  ? "ring-2 ring-blue-600 ring-offset-2 opacity-100" 
                  : "opacity-60 hover:opacity-100 hover:scale-105"
              }`}
            >
              <Image
                src={getImageUrl(img.url)}
                alt={`${address} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-50 hover:bg-white/10 rounded-full"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Main Lightbox Image */}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={getImageUrl(images[index].url)}
                  alt={`${address} - Fullscreen ${index + 1}`}
                  fill
                  className="object-contain"
                  quality={100}
                  priority
                />
              </motion.div>
            </div>

            {/* Navigation Buttons (Lightbox) */}
            {hasMultiple && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 md:left-8 p-3 text-white/70 hover:text-white transition-all hover:bg-white/10 rounded-full z-50"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 md:right-8 p-3 text-white/70 hover:text-white transition-all hover:bg-white/10 rounded-full z-50"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}

            {/* Caption / Counter */}
            <div className="absolute bottom-6 left-0 right-0 text-center text-white/80 font-medium">
              <p className="text-lg">{address}</p>
              <p className="text-sm opacity-60 mt-1">
                Image {index + 1} of {images.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

