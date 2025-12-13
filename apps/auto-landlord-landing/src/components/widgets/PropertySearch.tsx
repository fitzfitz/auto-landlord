"use client";

import { Search, MapPin, DollarSign, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PropertySearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/listings?q=${encodeURIComponent(location)}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl mt-8">
      <div className="flex-1 relative group">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-blue-400 transition-colors" size={20} />
        <input
          type="text"
          placeholder="City, Zip, or Neighborhood"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 focus:border-blue-400/50 transition-all"
        />
      </div>
      
      <div className="flex-1 relative group">
        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-green-400 transition-colors" size={20} />
        <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:bg-white/10 focus:border-green-400/50 transition-all cursor-pointer [&>option]:bg-slate-900">
          <option value="">Any Price</option>
          <option value="0-1000">Under $1,000</option>
          <option value="1000-2000">$1,000 - $2,000</option>
          <option value="2000-3000">$2,000 - $3,000</option>
          <option value="3000+">$3,000+</option>
        </select>
      </div>

      <div className="flex-1 relative group">
        <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-purple-400 transition-colors" size={20} />
        <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white appearance-none focus:outline-none focus:bg-white/10 focus:border-purple-400/50 transition-all cursor-pointer [&>option]:bg-slate-900">
          <option value="">Property Type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="condo">Condo</option>
        </select>
      </div>

      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
        <Search size={20} />
        <span className="hidden md:inline">Search</span>
      </button>
    </form>
  );
}

