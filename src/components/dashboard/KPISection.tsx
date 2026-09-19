"use client";

import * as React from "react";
import { Grid } from "@/components/layout/Grid";
import { StatCard } from "@/components/ui/StatCard";
import type { DashboardKPI } from "@/lib/data/dashboard-mock";
import { Users, FileText, Receipt, ClipboardList } from "lucide-react";

export function KPISection({ kpis }: { kpis: DashboardKPI[] }) {
  const getIcon = (id: string) => {
    switch (id) {
      case "kpi-1":
        return <Users className="w-4 h-4" />;
      case "kpi-2":
        return <FileText className="w-4 h-4" />;
      case "kpi-3":
        return <Receipt className="w-4 h-4" />;
      case "kpi-4":
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Grid cols={4} gap="md">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          subtitle={kpi.subtitle}
          icon={getIcon(kpi.id)}
          trend={kpi.trend}
          variant={kpi.variant}
        />
      ))}
    </Grid>
  );
}
