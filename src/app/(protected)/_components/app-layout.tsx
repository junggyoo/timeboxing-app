"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={handleMenuClick} />

      {/* Hide sidebar on xl screens when on dashboard for 4-column layout */}
      {isDashboard ? (
        <div className="xl:hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        </div>
      ) : (
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      )}

      <main
        className={cn(
          "pt-16 transition-all duration-300",
          "md:pl-[280px]",
          isDashboard && "xl:pl-0"
        )}
      >
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}
