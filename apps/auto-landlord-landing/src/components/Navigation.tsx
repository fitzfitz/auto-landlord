"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navigation() {
  return (
    <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                AutoLandlord
              </span>
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {["Browse Properties", "Solutions", "Pricing"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  href={
                    item === "Browse Properties"
                      ? "/listings"
                      : `/#${item.toLowerCase()}`
                  }
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link
              href="https://admin.auto-landlord.com"
              className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/listings"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Find a Home
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
