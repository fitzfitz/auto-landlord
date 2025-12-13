"use client";

import { motion } from "framer-motion";

const LOGOS = [
  "Stripe", "PayPal", "Plaid", "DocuSign", "TransUnion", "Equifax", "Experian", "Zillow", "Apartments.com"
];

export function TrustMarquee() {
  return (
    <div className="w-full bg-slate-50 border-y border-slate-200 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Trusted Integrations & Partners</p>
      </div>
      
      <div className="flex relative">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap px-8"
        >
          {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
            <span key={i} className="text-2xl font-bold text-slate-300 select-none">
              {logo}
            </span>
          ))}
        </motion.div>
        
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

