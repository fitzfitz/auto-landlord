"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Clock } from "lucide-react";

export function ROICalculator() {
  const [units, setUnits] = useState(10);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Assumptions based on industry averages
  const hoursSavedPerUnit = 4; // per month
  const valuePerHour = 50; // $
  const rentIncreasePercent = 0.05; // 5% better yield due to lower vacancy
  const avgRent = 1500;

  const monthlyHoursSaved = units * hoursSavedPerUnit;
  const monthlyRevenueIncrease =
    units * avgRent * rentIncreasePercent + monthlyHoursSaved * valuePerHour;
  const annualValue = monthlyRevenueIncrease * 12;

  // Format currency consistently to avoid hydration mismatch
  const formatCurrency = (val: number) => {
    if (!isMounted) return "...";
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Calculate Your ROI</h2>
          <p className="text-slate-400 mb-8 text-lg">
            See how much time and money you could save by switching to automated
            property management.
          </p>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">
              Number of Units:{" "}
              <span className="text-blue-400 text-xl ml-2">{units}</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={units}
              onChange={(e) => setUnits(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
              <span>1 Unit</span>
              <span>100 Units</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 flex-1 border border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase">
                  Hours Saved / Mo
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {monthlyHoursSaved}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 flex-1 border border-slate-700">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <DollarSign size={16} />
                <span className="text-xs font-bold uppercase">Value / Mo</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                ${formatCurrency(monthlyRevenueIncrease)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-center shadow-2xl transform hover:scale-105 transition-transform duration-500">
          <p className="text-white/80 font-medium mb-2">
            Potential Annual Value
          </p>
          <motion.div
            key={annualValue}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-extrabold text-white mb-6"
          >
            ${formatCurrency(annualValue)}
          </motion.div>
          <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Start Saving Today
          </button>
          <p className="text-white/60 text-xs mt-4 max-w-xs mx-auto">
            *Estimates based on average administrative time savings and vacancy
            reduction rates.
          </p>
        </div>
      </div>
    </div>
  );
}
