import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
};

export function KpiCard({ label, value, detail, icon: Icon }: KpiCardProps) {
  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-foreground-2">{label}</p>
        <Icon className="h-4 w-4 text-accent" aria-hidden />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      {detail && <p className="mt-1 text-xs text-foreground-3">{detail}</p>}
    </Card>
  );
}
