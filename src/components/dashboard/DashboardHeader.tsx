"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Badge } from "@/components/ui/Badge";
import { Clock } from "lucide-react";

export function DashboardHeader() {
  const { user, role } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = new Intl.DateTimeFormat("en-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const userName = user?.name || "Operations Team";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#E2E8F0] mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0F172A]">
            {getGreeting()}, {userName}
          </h1>
          <Badge variant={role === "ADMIN" ? "primary" : "navy"} size="sm">
            {role}
          </Badge>
        </div>
        <p className="text-xs md:text-sm text-[#64748B]">
          Overview of commercial proposals, tax invoices, purchase orders, and field service operations.
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs text-xs text-[#475569] font-medium">
          <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{formattedDate}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[#15803D] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
            Dubai Live
          </span>
        </div>
      </div>
    </div>
  );
}
