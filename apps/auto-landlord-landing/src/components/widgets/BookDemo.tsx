"use client";

import { Calendar, Clock, Video } from "lucide-react";

export function BookDemo() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col lg:flex-row">
      {/* Left Info Panel */}
      <div className="bg-slate-900 text-white p-8 lg:p-12 lg:w-1/3 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-6">Schedule a Demo</h3>
          <p className="text-slate-300 mb-8">
            See how AutoLandlord can streamline your operations. Our product experts will guide you through a personalized tour.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-semibold">30 Minutes</p>
                <p className="text-sm text-slate-400">Duration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Video size={20} />
              </div>
              <div>
                <p className="font-semibold">Google Meet</p>
                <p className="text-sm text-slate-400">Video Call</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <p className="font-semibold">Customized</p>
                <p className="text-sm text-slate-400">Tailored to your portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Calendar Panel (Mock UI) */}
      <div className="p-8 lg:p-12 lg:w-2/3 bg-white">
        <h4 className="font-bold text-slate-900 mb-6 text-lg">Select a Date & Time</h4>
        
        {/* Date Grid Mock */}
        <div className="grid grid-cols-7 gap-2 mb-8 text-center text-sm">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-slate-400 font-medium py-2">{d}</div>
          ))}
          {/* Days */}
          {[...Array(31)].map((_, i) => (
            <button
              key={i}
              disabled={i < 10 || i > 25} // Mock disabled days
              className={`p-3 rounded-lg font-medium transition-all ${
                i === 14 // Selected Day
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : i < 10 || i > 25
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <h4 className="font-bold text-slate-900 mb-4 text-lg">Available Times</h4>
        <div className="grid grid-cols-3 gap-4">
          {["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"].map((time) => (
            <button
              key={time}
              className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:border-blue-500 hover:text-blue-600 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

