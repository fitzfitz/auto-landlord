import DashboardSidebar from "@/components/dashboard-sidebar";

import { getOrCreateUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role={user.role} />
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
}
