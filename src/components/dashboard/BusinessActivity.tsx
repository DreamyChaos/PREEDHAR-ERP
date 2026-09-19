"use client";

import * as React from "react";
import { Panel } from "@/components/layout/Panel";
import { formatAED } from "@/lib/utils";
import type { ActivityMetric } from "@/lib/data/dashboard-mock";
import { BarChart3, TrendingUp } from "lucide-react";

export function BusinessActivity({ metrics }: { metrics: ActivityMetric[] }) {
  const totalVolume = metrics.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Panel
      title={
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#2563EB]" />
          <span>Commercial & Operational Activity</span>
        </div>
      }
      subtitle="Overview of documents processed and active commercial volume this period"
      headerAction={
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-[#15803D]" />
          <span className="font-semibold text-[#475569]">Total Volume:</span>
          <span className="font-bold text-[#0F172A] font-numeric">
            {formatAED(totalVolume)}
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#334155]">
                  {metric.category}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-[#475569] font-bold font-numeric">
                  {metric.count} docs
                </span>
              </div>
              <span className="font-bold text-[#0F172A] font-numeric">
                {formatAED(metric.amount)}
              </span>
            </div>

            {/* Custom Clean Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metric.category === "Quotations"
                    ? "bg-[#2563EB]"
                    : metric.category === "Invoices"
                    ? "bg-[#0B1F33]"
                    : metric.category === "Purchase Orders"
                    ? "bg-[#0284C7]"
                    : "bg-[#15803D]"
                }`}
                style={{ width: `${metric.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
