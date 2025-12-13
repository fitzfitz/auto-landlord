import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Menu } from "lucide-react";
import { useUIStore } from "@/store/ui.store";

export const DashboardLayout = () => {
  const { toggleSidebar } = useUIStore();

  return (
    <div className="flex min-h-screen bg-dark-gradient text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-glass/50 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white p-2"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* User Profile or other header items */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
