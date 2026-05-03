import type { Metadata } from "next";
import {
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowUpRight,
  FileText,
  ChevronRight,
  Circle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard — SupportPilot AI",
  robots: "noindex",
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total conversations",
    value: "1,247",
    delta: "+12% this week",
    icon: MessageSquare,
    positive: true,
  },
  {
    label: "Deflection rate",
    value: "73%",
    delta: "+4 pts vs last month",
    icon: TrendingUp,
    positive: true,
  },
  {
    label: "Avg. response time",
    value: "2.3s",
    delta: "−0.4s vs last week",
    icon: Zap,
    positive: true,
  },
  {
    label: "Escalation rate",
    value: "18%",
    delta: "−2 pts vs last month",
    icon: ArrowUpRight,
    positive: true,
  },
] as const;

type Status = "resolved" | "escalated" | "active";

const CONVERSATIONS: {
  id: string;
  user: string;
  initials: string;
  preview: string;
  status: Status;
  time: string;
}[] = [
  {
    id: "c1",
    user: "Sarah Chen",
    initials: "SC",
    preview: "Does the Pro plan include Roadmaps?",
    status: "resolved",
    time: "2 min ago",
  },
  {
    id: "c2",
    user: "Marcos Rivera",
    initials: "MR",
    preview: "I need to cancel my subscription and get a refund.",
    status: "escalated",
    time: "8 min ago",
  },
  {
    id: "c3",
    user: "Priya Nair",
    initials: "PN",
    preview: "How do I connect Linear-clone to GitHub?",
    status: "resolved",
    time: "14 min ago",
  },
  {
    id: "c4",
    user: "Tom Whitfield",
    initials: "TW",
    preview: "Are you SOC 2 certified?",
    status: "active",
    time: "just now",
  },
  {
    id: "c5",
    user: "Aiko Tanaka",
    initials: "AT",
    preview: "Can I upgrade mid-cycle without losing data?",
    status: "resolved",
    time: "31 min ago",
  },
  {
    id: "c6",
    user: "David Osei",
    initials: "DO",
    preview: "We need custom roles for our enterprise team.",
    status: "escalated",
    time: "45 min ago",
  },
  {
    id: "c7",
    user: "Lena Fischer",
    initials: "LF",
    preview: "What's the difference between Pro and Business?",
    status: "resolved",
    time: "1 hr ago",
  },
  {
    id: "c8",
    user: "James Park",
    initials: "JP",
    preview: "The Slack integration stopped syncing after yesterday.",
    status: "escalated",
    time: "2 hrs ago",
  },
];

const KNOWLEDGE_FILES = [
  { name: "pricing.md", size: "4.2 KB", updated: "2 days ago" },
  { name: "features.md", size: "11.8 KB", updated: "2 days ago" },
  { name: "integrations.md", size: "7.1 KB", updated: "5 days ago" },
  { name: "security.md", size: "5.6 KB", updated: "1 week ago" },
  { name: "billing.md", size: "3.9 KB", updated: "1 week ago" },
];

const STATUS_CONFIG: Record<Status, { label: string; variant: "success" | "error" | "info" }> = {
  resolved:  { label: "Resolved",  variant: "success" },
  escalated: { label: "Escalated", variant: "error"   },
  active:    { label: "Active",    variant: "info"     },
};

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  return (
    <div
      className={[
        "rounded-full bg-accent-soft text-accent font-semibold flex items-center justify-center shrink-0",
        size === "md" ? "w-9 h-9 text-sm" : "w-7 h-7 text-xs",
      ].join(" ")}
    >
      {initials}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-accent-fg text-xs font-bold">
              P
            </div>
            <span className="text-sm font-semibold text-foreground">SupportPilot</span>
            <ChevronRight className="w-3.5 h-3.5 text-foreground-2" aria-hidden />
            <span className="text-sm text-foreground-2">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground-2 hidden sm:block">Linear-clone workspace</span>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-fg text-xs font-bold">
              AP
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-foreground-2">Last 30 days · Linear-clone workspace</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="px-5 py-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-foreground-2 font-medium leading-snug">{s.label}</span>
                  <Icon className="w-4 h-4 text-foreground-2 shrink-0" aria-hidden />
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-foreground-2">{s.delta}</p>
              </Card>
            );
          })}
        </div>

        {/* Main area: table + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Conversations table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent conversations</h2>
              <span className="text-xs text-foreground-2">{CONVERSATIONS.length} shown</span>
            </div>

            <div className="divide-y divide-border">
              {CONVERSATIONS.map((c) => {
                const { label, variant } = STATUS_CONFIG[c.status];
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[color-mix(in_srgb,var(--color-foreground)_3%,transparent)] transition-colors cursor-pointer"
                  >
                    <Avatar initials={c.initials} size="sm" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {c.user}
                        </span>
                        {c.status === "active" && (
                          <Circle className="w-1.5 h-1.5 fill-blue-500 text-blue-500 shrink-0" aria-hidden />
                        )}
                      </div>
                      <p className="text-xs text-foreground-2 truncate mt-0.5">{c.preview}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={variant}>{label}</Badge>
                      <span className="text-xs text-foreground-2 hidden sm:block w-20 text-right">
                        {c.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-border">
              <button className="text-xs text-accent font-medium hover:underline">
                View all conversations →
              </button>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Knowledge sources */}
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Knowledge sources</h2>
                <span className="text-xs text-foreground-2">{KNOWLEDGE_FILES.length} files</span>
              </div>

              <div className="divide-y divide-border">
                {KNOWLEDGE_FILES.map((f) => (
                  <div
                    key={f.name}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[color-mix(in_srgb,var(--color-foreground)_3%,transparent)] transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-foreground-2 shrink-0" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground font-mono">{f.name}</p>
                      <p className="text-xs text-foreground-2">{f.size} · {f.updated}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-border">
                <button className="text-xs text-accent font-medium hover:underline">
                  + Add source
                </button>
              </div>
            </Card>

            {/* Quick stats */}
            <Card className="px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground mb-4">Today at a glance</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "New conversations", value: "34" },
                  { label: "Resolved by AI", value: "27" },
                  { label: "Escalated to human", value: "7" },
                  { label: "Avg. CSAT", value: "4.8 / 5" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-foreground-2">{row.label}</span>
                    <span className="text-xs font-semibold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
