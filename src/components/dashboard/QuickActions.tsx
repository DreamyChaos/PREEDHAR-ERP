"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  UserPlus,
  FilePlus,
  Receipt,
  ClipboardPlus,
  CheckSquare,
  Zap,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "New Customer",
      href: "/customers",
      icon: <UserPlus className="w-3.5 h-3.5" />,
      variant: "secondary" as const,
    },
    {
      title: "New Quotation",
      href: "/quotations",
      icon: <FilePlus className="w-3.5 h-3.5" />,
      variant: "primary" as const,
    },
    {
      title: "New Invoice",
      href: "/invoices",
      icon: <Receipt className="w-3.5 h-3.5" />,
      variant: "navy" as const,
    },
    {
      title: "New Purchase Order",
      href: "/purchase-orders",
      icon: <ClipboardPlus className="w-3.5 h-3.5" />,
      variant: "secondary" as const,
    },
    {
      title: "New Work Report",
      href: "/work-completion",
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] uppercase tracking-wider shrink-0">
        <Zap className="w-4 h-4 text-[#2563EB]" />
        <span>Quick Actions</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {actions.map((act) => (
          <Link key={act.title} href={act.href}>
            <Button
              variant={act.variant}
              size="sm"
              leftIcon={act.icon}
              className="h-8 text-xs font-semibold"
            >
              {act.title}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
