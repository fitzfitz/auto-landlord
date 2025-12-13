"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LayoutGrid, Map as MapIcon, Search, SlidersHorizontal } from "lucide-react";
import { PublicProperty } from "@/lib/api";
import { ListingFilters } from "./ListingFilters";
import { ListingCard } from "./ListingCard";

// Dynamic import for Map to avoid SSR issues
const ListingMap = dynamic(() => import("./ListingMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">
      Loading Map...
    </div>
  )
});

interface ListingsLayoutProps {
  initialListings: PublicProperty[];
}

export function ListingsLayout({ initialListings }: ListingsLayoutProps) {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Find Your Next Home
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by city, neighborhood, or address..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-600 placeholder:text-slate-400"
              />
            </div>

            {/* View Toggles */}
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 flex-1 justify-center"
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>

              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 ml-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    viewMode === "grid" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <LayoutGrid size={18} />
                  List
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    viewMode === "map" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <MapIcon size={18} />
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <ListingFilters />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {initialListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
                
                {/* Lead Capture Banner (Mock) */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-center text-white my-8 shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Don't see what you're looking for?</h3>
                    <p className="text-blue-100 mb-6">Get notified instantly when new properties hit the market.</p>
                    <div className="flex max-w-md mx-auto gap-2">
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="flex-1 px-4 py-3 rounded-xl text-slate-900 focus:outline-none"
                      />
                      <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                        Notify Me
                      </button>
                    </div>
                  </div>
                  {/* Decor */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </div>
              </div>
            ) : (
              /* Map View */
              <div className="h-[calc(100vh-200px)] sticky top-24">
                <ListingMap listings={initialListings} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

