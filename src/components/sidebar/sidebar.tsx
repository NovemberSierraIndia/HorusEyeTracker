"use client";

import { useState, useEffect } from "react";
import { EyeIcon } from "@/components/icons/eye-icon";
import { Clock } from "./clock";
import { NavItem } from "./nav-item";
import { UserInfo } from "./user-info";
import {
  LayoutDashboard,
  CalendarDays,
  FolderKanban,
  Rocket,
  ClipboardCheck,
  Menu,
  X,
} from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setCollapsed(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetch("/api/gmail/unread")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.count || 0))
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { href: "/calendar", icon: <CalendarDays size={20} />, label: "Calendar & Inbox", badge: unreadCount },
    { href: "/projects", icon: <FolderKanban size={20} />, label: "Projects" },
    { href: "/career", icon: <Rocket size={20} />, label: "Career Engine" },
    { href: "/review", icon: <ClipboardCheck size={20} />, label: "Weekly Review" },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-cream-light border-r border-border">
      {/* Logo */}
      <div className={`px-4 py-4 flex items-center gap-2 border-b border-border ${collapsed ? "justify-center px-2" : ""}`}>
        <EyeIcon className="w-7 h-7 text-brg shrink-0" />
        {!collapsed && (
          <span className="text-lg font-medium text-text-primary tracking-tight">
            HorusEye
          </span>
        )}
      </div>

      {/* Clock */}
      {!collapsed && <Clock />}

      {/* Navigation */}
      <nav className="flex-1 py-2 space-y-0.5">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User Info */}
      <UserInfo collapsed={collapsed} />
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-cream-light rounded-card border border-border"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-200 ${
          collapsed ? "w-[60px]" : "w-[220px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
