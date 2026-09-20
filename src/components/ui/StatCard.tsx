import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  variant?: "default" | "blue" | "navy" | "orange";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const iconVariantStyles = {
    default: "bg-slate-50 text-[#475569] border-[#E2E8F0]",
    blue: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    orange: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]", // normalized to corporate blue
    navy: "bg-[#F1F5F9] text-[#0B1F33] border-[#CBD5E1]",
  };

  return (
    <div
      className={cn(
        "relative p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-slate-300",
        className
      )}
    >
      {/* Orange left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#E07614] rounded-r-full" />
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] pl-1">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center border shrink-0",
              iconVariantStyles[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-[#0F172A] font-numeric">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center font-medium font-numeric",
                  trend.direction === "up" && "text-[#15803D]",
                  trend.direction === "down" && "text-[#B91C1C]",
                  trend.direction === "neutral" && "text-[#64748B]"
                )}
              >
                {trend.direction === "up" && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                {trend.direction === "down" && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {trend.direction === "neutral" && <Minus className="w-3.5 h-3.5 mr-0.5" />}
                {trend.value}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
            {trend?.label && <span className="text-slate-400">{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
