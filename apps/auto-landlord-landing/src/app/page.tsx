"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  BarChart3,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { PropertySearch } from "@/components/widgets/PropertySearch";
import { ActivityTicker } from "@/components/widgets/ActivityTicker";
import { TrustMarquee } from "@/components/widgets/TrustMarquee";
import { FeatureComparison } from "@/components/widgets/FeatureComparison";
import { ROICalculator } from "@/components/widgets/ROICalculator";
import { TestimonialCarousel } from "@/components/widgets/TestimonialCarousel";
import { BookDemo } from "@/components/widgets/BookDemo";

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Navigation />
      <ActivityTicker />

      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
        >
          <source
            src="https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60" />

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Hero Content */}
              <motion.div
                className="text-center lg:text-left"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold mb-8 mx-auto lg:mx-0 w-fit"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                  </span>
                  New Listings Added Daily
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-lg"
                >
                  Modern Property Management <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                    Simplified.
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-xl text-white/80 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                >
                  The all-in-one platform for seamless rental experiences.
                  Automated workflows for landlords, instant applications for
                  tenants.
                </motion.p>

                <motion.div variants={fadeInUp}>
                  <PropertySearch />
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
                >
                  <Link
                    href="/listings"
                    className="text-white/80 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors"
                  >
                    Or browse all listings <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Floating Dashboard Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                {/* Main Glass Card - Dashboard Preview */}
                <div className="relative">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold">Dashboard</p>
                          <p className="text-white/50 text-xs">
                            Property Overview
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                    </div>

                    {/* Mini Chart Visual */}
                    <div className="bg-white/5 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-end h-24">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                            className="w-6 bg-linear-to-t from-blue-500 to-cyan-400 rounded-t-md"
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-white/40 text-[10px]">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">12</p>
                        <p className="text-white/50 text-xs">Properties</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-400">98%</p>
                        <p className="text-white/50 text-xs">Occupied</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-white">$24k</p>
                        <p className="text-white/50 text-xs">Revenue</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Card 1 - Application Status */}
                  <motion.div
                    initial={{ y: 30, opacity: 0, x: -20 }}
                    animate={{ y: 0, opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-2xl w-56"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Application Status
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          Approved
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Floating Card 2 - Payment Notification */}
                  <motion.div
                    initial={{ y: -30, opacity: 0, x: 20 }}
                    animate={{ y: 0, opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-2xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <p className="text-xs font-bold text-slate-700">
                        New Rent Payment
                      </p>
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      $2,400.00
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Received just now
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Stats - Animated */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12"
            >
              {[
                {
                  label: "Active Properties",
                  value: "2,000+",
                  icon: Building2,
                },
                { label: "Happy Tenants", value: "15k+", icon: Users },
                { label: "Cities Covered", value: "120+", icon: CheckCircle2 },
                { label: "Uptime", value: "99.9%", icon: BarChart3 },
              ].map((stat) => (
                <div key={stat.label} className="group cursor-default">
                  <div className="flex items-center gap-2 mb-2 text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity">
                    <stat.icon size={20} />
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/50 font-medium uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Marquee */}
      <TrustMarquee />

      {/* Solutions / Feature Comparison */}
      <section id="solutions" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4"
            >
              One Platform, Two Perspectives
            </motion.h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              AutoLandlord seamlessly connects landlords and tenants with
              tailored tools for everyone.
            </p>
          </div>

          <FeatureComparison />
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Stop Wasting Time & Money
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Calculate the potential return on investment by switching to
              AutoLandlord.
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Loved by Landlords
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join thousands of property owners who have modernized their
              business.
            </p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* Book Demo Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookDemo />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-blue-600/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-5xl font-bold mb-8"
          >
            Transform Your Property Business Today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto"
          >
            Join the platform trusted by modern landlords and property managers
            worldwide. Start for free, upgrade as you grow.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              href="https://admin.auto-landlord.com"
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:scale-105"
            >
              Get Started for Free
            </Link>
            <Link
              href="/listings"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all hover:scale-105"
            >
              View Demo Listings
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold text-slate-900">
                AutoLandlord
              </span>
              <p className="mt-4 text-slate-500 max-w-xs">
                The modern standard for property management software.
                Simplifying rentals for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <Link
                    href="/listings"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Browse Listings
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 AutoLandlord Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
