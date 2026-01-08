"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Timer, BarChart3, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    icon: Home,
    label: "대시보드",
    href: "/dashboard",
  },
  {
    icon: Timer,
    label: "타이머",
    href: "/timer",
  },
  {
    icon: BarChart3,
    label: "리포트",
    href: "/reports",
  },
  {
    icon: Settings,
    label: "설정",
    href: "/settings",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 w-[280px] bg-white border-r border-gray-200 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="메뉴 닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#2563EB]/10 text-[#2563EB]"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-900 mb-1">
                오늘의 진행률
              </p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "65%" }} />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                3/5 타임박스 완료
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
