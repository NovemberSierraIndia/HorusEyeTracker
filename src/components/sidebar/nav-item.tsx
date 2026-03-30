"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  collapsed?: boolean;
}

export function NavItem({ href, icon, label, badge, collapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative ${
        isActive
          ? "bg-brg-light text-brg font-medium border-l-[3px] border-brg"
          : "text-text-secondary hover:text-text-primary hover:bg-cream border-l-[3px] border-transparent"
      } ${collapsed ? "justify-center px-0" : ""}`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="destructive" className="bg-racing-red text-white text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full px-1.5">
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
}
