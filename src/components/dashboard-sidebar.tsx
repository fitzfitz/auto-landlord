"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  Users,
  Wrench,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const landlordNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/tenants", label: "Tenants", icon: Users },
  { href: "/dashboard/tickets", label: "Tickets", icon: Wrench },
  { href: "/dashboard/applications", label: "Applications", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const tenantNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/tickets", label: "My Tickets", icon: Wrench },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const navItems = role === "TENANT" ? tenantNavItems : landlordNavItems;

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">AutoLandlord</h2>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-800">
        <SignOutButton>
          <button className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white w-full transition">
            <LogOut size={20} />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
