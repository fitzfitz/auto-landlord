"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, BedDouble, Bath, Home } from "lucide-react";
import { getImageUrl, PublicProperty } from "@/lib/api";

interface ListingCardProps {
  listing: PublicProperty;
}

export function ListingCard({ listing }: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Ensure we have at least one image or a placeholder
  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [{ url: "", id: "placeholder" }];

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  // Cycle images on hover
  // In a real app, you might want manual arrows or timed interval
  // For this "pro" feel, we'll show navigation dots on hover

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const currentImageUrl = images[currentImageIndex].url 
    ? getImageUrl(images[currentImageIndex].url)
    : null;

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group block h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 border border-white/20 shadow-sm">
            {listing.propertyType || "Property"}
          </span>
          {/* Mock "New" badge for demo */}
          <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm shadow-blue-600/20">
            New
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm"
        >
          <Heart 
            size={16} 
            className={isFavorite ? "fill-red-500 text-red-500" : "text-slate-600"} 
          />
        </button>

        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={listing.address}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300">
                  <Home className="w-12 h-12" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Hover Navigation (if multiple images) */}
          {images.length > 1 && isHovered && (
            <div className="absolute inset-0 flex items-center justify-between p-2 z-20">
              <button 
                onClick={prevImage}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-all"
              >
                <span className="sr-only">Previous</span>
                ←
              </button>
              <button 
                onClick={nextImage}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-all"
              >
                <span className="sr-only">Next</span>
                →
              </button>
            </div>
          )}

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {images.slice(0, 5).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${
                    i === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                  }`} 
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
              {listing.address}
            </h2>
            <div className="flex items-center text-slate-500 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {listing.city}, {listing.state} {listing.zip}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-slate-600">
              <BedDouble className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">{listing.bedrooms ?? "-"} Beds</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Bath className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium">{listing.bathrooms ?? "-"} Baths</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                ${listing.rentAmount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Per Month</p>
            </div>
            <span className="px-4 py-2 bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

