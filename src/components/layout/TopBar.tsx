"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useShell } from "./ShellProvider";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronRight,
  Loader2,
} from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
  const { toggleMobileDrawer } = useShell();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Generate dynamic breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);
  const pageTitle =
    segments.length > 0
      ? segments[0]
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Dashboard";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left Area: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileDrawer}
          aria-label="Open navigation menu"
          className="lg:hidden w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#64748B]">
          <Link
            href="/dashboard"
            className="hover:text-[#0F172A] transition-colors font-medium text-[#475569] hidden sm:inline"
          >
            PTS ERP
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-1.5 hidden sm:inline" />
          <span className="font-bold text-[#0F172A] text-sm">
            {pageTitle}
          </span>
        </nav>
      </div>

      {/* Right Area: Notification + User Menu */}
      <div className="flex items-center gap-3">
        {/* Notification indicator */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-slate-400 rounded-full" />
        </button>

        <div className="h-5 w-px bg-[#E2E8F0]" />

        {/* User Account Menu Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#0B1F33] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-semibold text-[#0F172A] hidden md:inline truncate max-w-[140px]">
                {user?.name || "Staff Member"}
              </span>
            </button>
          }
          items={[
            {
              id: "profile_header",
              label: (
                <div className="py-1">
                  <p className="text-xs font-bold text-[#0F172A] truncate">
                    {user?.name || "Staff Member"}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate">
                    {user?.email || "user@preedhar.local"}
                  </p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                    {role}
                  </span>
                </div>
              ),
              disabled: true,
            },
            { id: "divider-1", label: "", disabled: true },
            {
              id: "settings",
              label: "Company Settings",
              icon: <Settings className="w-3.5 h-3.5 text-[#64748B]" />,
              onClick: () => {
                window.location.href = "/settings";
              },
            },
            {
              id: "logout",
              label: isLoggingOut ? "Signing out..." : "Sign Out",
              icon: isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
              ),
              variant: "destructive",
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </header>
  );
}
