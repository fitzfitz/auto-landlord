import Link from "next/link";
import { Building2, Zap, Shield, TrendingUp } from "lucide-react";

import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Building2 size={32} />
          AutoLandlord
        </div>
        <div className="flex gap-4">
          {userId ? (
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-100"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-100"
              >
                Start Free
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          Stop Taking
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Maintenance Calls
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          The self-processing property management platform for small landlords.
          Automate rent collection, vacancy marketing, and tenant communication.
        </p>
        {userId ? (
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-100"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-100"
          >
            Get Started Free
          </Link>
        )}
        <p className="text-sm text-gray-400 mt-4">
          No credit card required • 2 properties free forever
        </p>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur p-8 rounded-xl border border-gray-700">
            <Zap className="text-yellow-400 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Instant Listings</h3>
            <p className="text-gray-400">
              Generate beautiful property landing pages and social media posts
              in seconds. Market vacancies automatically.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur p-8 rounded-xl border border-gray-700">
            <Shield className="text-green-400 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Self-Service Portal</h3>
            <p className="text-gray-400">
              Tenants submit tickets, pay rent, and view documents. No more 2 AM
              phone calls about leaky faucets.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur p-8 rounded-xl border border-gray-700">
            <TrendingUp className="text-blue-400 mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">Smart Automation</h3>
            <p className="text-gray-400">
              Automated lease renewals, rent reminders, and vacancy alerts. The
              platform runs itself.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800/30 p-8 rounded-xl border border-gray-700">
            <h3 className="text-lg font-medium text-gray-400">Starter</h3>
            <div className="text-5xl font-bold my-4">$0</div>
            <ul className="space-y-3 text-gray-300 mb-6">
              <li>✓ Up to 2 properties</li>
              <li>✓ Basic ticket system</li>
              <li>✓ Public listings</li>
            </ul>
            <Link
              href="/sign-up"
              className="block w-full text-center py-2 border border-gray-600 rounded-md hover:bg-gray-700"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-xl transform scale-105">
            <h3 className="text-lg font-medium">Pro</h3>
            <div className="text-5xl font-bold my-4">$29</div>
            <ul className="space-y-3 mb-6">
              <li>✓ Up to 20 properties</li>
              <li>✓ Rent collection</li>
              <li>✓ Marketing automation</li>
              <li>✓ Tenant portal</li>
            </ul>
            <Link
              href="/sign-up"
              className="block w-full text-center py-2 bg-white text-black rounded-md font-semibold hover:bg-gray-100"
            >
              Start Free Trial
            </Link>
          </div>

          <div className="bg-gray-800/30 p-8 rounded-xl border border-gray-700">
            <h3 className="text-lg font-medium text-gray-400">Business</h3>
            <div className="text-5xl font-bold my-4">$99</div>
            <ul className="space-y-3 text-gray-300 mb-6">
              <li>✓ Unlimited properties</li>
              <li>✓ Team members</li>
              <li>✓ Custom branding</li>
              <li>✓ Priority support</li>
            </ul>
            <Link
              href="/sign-up"
              className="block w-full text-center py-2 border border-gray-600 rounded-md hover:bg-gray-700"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-500">
          <p>
            © 2025 AutoLandlord. Built for small landlords who want their time
            back.
          </p>
        </div>
      </footer>
    </div>
  );
}
