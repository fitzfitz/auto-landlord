"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Property Manager, Seattle",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    quote: "AutoLandlord completely transformed how I manage my 12 units. The automated rent collection alone saves me 5 hours a month.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Private Landlord, Austin",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    quote: "The tenant screening feature is a lifesaver. I used to spend days calling references, now I get a full report in minutes.",
    rating: 5,
  },
  {
    name: "David Wilson",
    role: "Portfolio Owner, Chicago",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    quote: "Scalability was my biggest concern. AutoLandlord grew with me from 5 units to 50 without skipping a beat.",
    rating: 5,
  },
];

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prev = () => setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <div className="relative max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 text-center"
        >
          <div className="absolute top-8 left-8 text-blue-100">
            <Quote size={60} />
          </div>
          
          <div className="relative z-10">
            <img
              src={TESTIMONIALS[index].image}
              alt={TESTIMONIALS[index].name}
              className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-slate-50 shadow-md object-cover"
            />
            
            <div className="flex justify-center gap-1 mb-6 text-yellow-400">
              {[...Array(TESTIMONIALS[index].rating)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>

            <p className="text-2xl font-medium text-slate-800 mb-8 leading-relaxed italic">
              "{TESTIMONIALS[index].quote}"
            </p>

            <div>
              <h4 className="font-bold text-slate-900 text-lg">{TESTIMONIALS[index].name}</h4>
              <p className="text-slate-500">{TESTIMONIALS[index].role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={next}
          className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

