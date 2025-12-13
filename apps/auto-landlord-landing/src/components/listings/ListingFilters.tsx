"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-semibold text-slate-900 mb-2"
      >
        {title}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-2 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ListingFilters() {
  const [priceRange, setPriceRange] = useState([1000, 5000]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-900">Filters</h3>
        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
          Reset
        </button>
      </div>

      <FilterSection title="Price Range">
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-3 text-sm text-slate-600 font-medium">
            <span>$500</span>
            <span>$10,000+</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Property Type">
        <div className="space-y-3">
          {["Apartment", "House", "Condo", "Townhouse"].map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 rounded bg-white transition-colors group-hover:border-blue-400">
                <input type="checkbox" className="peer appearance-none w-full h-full absolute inset-0 opacity-0 cursor-pointer" />
                <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 bg-blue-600 w-full h-full rounded peer-checked:block" />
              </div>
              <span className="text-slate-600 group-hover:text-slate-900">{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Bedrooms">
        <div className="flex gap-2">
          {["Any", "1+", "2+", "3+", "4+"].map((bed, i) => (
            <button
              key={bed}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                i === 0
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {bed}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Amenities" defaultOpen={false}>
        <div className="space-y-3">
          {["Pet Friendly", "Parking", "In-Unit Laundry", "Air Conditioning", "Pool", "Gym"].map((amenity) => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 rounded bg-white transition-colors group-hover:border-blue-400">
                <input type="checkbox" className="peer appearance-none w-full h-full absolute inset-0 opacity-0 cursor-pointer" />
                <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 bg-blue-600 w-full h-full rounded peer-checked:block" />
              </div>
              <span className="text-slate-600 group-hover:text-slate-900">{amenity}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

