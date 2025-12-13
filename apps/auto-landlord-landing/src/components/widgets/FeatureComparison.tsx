"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Zap, Smartphone, Clock, CreditCard } from "lucide-react";

const FEATURES = {
  landlord: {
    title: "For Landlords",
    color: "bg-blue-600",
    items: [
      { icon: CreditCard, title: "Automated Rent Collection", desc: "Set it and forget it. Money deposited directly to your bank account." },
      { icon: Shield, title: "Tenant Screening", desc: "Full credit, criminal, and eviction reports in seconds." },
      { icon: Clock, title: "Maintenance Tracking", desc: "Manage requests and vendors from a single dashboard." },
    ]
  },
  tenant: {
    title: "For Tenants",
    color: "bg-green-600",
    items: [
      { icon: Smartphone, title: "Mobile App", desc: "Pay rent and submit requests from your phone." },
      { icon: Zap, title: "Instant Applications", desc: "Apply to multiple properties with one profile." },
      { icon: CreditCard, title: "Credit Building", desc: "Report on-time rent payments to boost your credit score." },
    ]
  }
};

export function FeatureComparison() {
  const [activeTab, setActiveTab] = useState<"landlord" | "tenant">("landlord");

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Toggle Header */}
      <div className="flex border-b border-slate-100">
        {(Object.keys(FEATURES) as Array<keyof typeof FEATURES>).map((role) => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            className={`flex-1 py-6 text-center font-bold text-lg transition-all relative ${
              activeTab === role ? "text-slate-900 bg-slate-50" : "text-slate-400 hover:bg-slate-50/50"
            }`}
          >
            {FEATURES[role].title}
            {activeTab === role && (
              <motion.div
                layoutId="activeTab"
                className={`absolute bottom-0 left-0 right-0 h-1 ${FEATURES[role].color}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8 md:p-12 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {FEATURES[activeTab].items.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 rounded-xl ${activeTab === 'landlord' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} flex items-center justify-center mb-4`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  <Check size={16} className={activeTab === 'landlord' ? 'text-blue-600' : 'text-green-600'} />
                  <span>Included in all plans</span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

