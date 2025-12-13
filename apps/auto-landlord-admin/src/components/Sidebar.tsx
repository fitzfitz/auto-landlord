import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "@/store/ui.store";
import { useAuthContext } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Ticket,
  FileText,
  Settings,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export const Sidebar = () => {
  const { sidebarOpen, closeSidebar } = useUIStore();
  const { logout } = useAuthContext();
  const location = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/properties", label: "Properties", icon: Building2 },
    { href: "/tenants", label: "Tenants", icon: Users },
    { href: "/tickets", label: "Tickets", icon: Ticket },
    { href: "/applications", label: "Applications", icon: FileText },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-glass/80 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0 lg:static lg:bg-transparent",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
            AutoLandlord
          </span>
          <button
            onClick={closeSidebar}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const Icon: LucideIcon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <div key={link.href}>
                <Link
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary-500/20 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={20} />
                  {link.label}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
