"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle2, UserPlus, DollarSign, Home } from "lucide-react";

const ACTIVITIES = [
  { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-100", text: "New tenant application for Unit 4B" },
  { icon: DollarSign, color: "text-green-500", bg: "bg-green-100", text: "Rent payment received: $2,400" },
  { icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-100", text: "Maintenance request resolved" },
  { icon: Home, color: "text-indigo-500", bg: "bg-indigo-100", text: "New property listed in Seattle" },
];

export function ActivityTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ACTIVITIES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const Activity = ACTIVITIES[index];
  const Icon = Activity.icon;

  return (
    <div className="fixed bottom-8 left-8 z-50 hidden md:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm"
        >
          <div className={`w-10 h-10 ${Activity.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${Activity.color}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Live Activity</p>
            <p className="text-sm font-semibold text-slate-900">{Activity.text}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

