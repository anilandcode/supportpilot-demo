import Link from "next/link";
import { BarChart3, Bell, CheckSquare, CreditCard, Database, Globe2, Inbox, LayoutDashboard, Search, Settings, ShieldCheck } from "lucide-react";
import { getCurrentEnterpriseUser } from "@/lib/auth/roles";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tickets", label: "Tickets", icon: Inbox },
  { href: "/admin/knowledge", label: "Knowledge", icon: Database },
  { href: "/admin/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type AdminShellProps = {
  title: string;
  description: string;
  active: string;
  children: React.ReactNode;
};

export async function AdminShell({ title, description, active, children }: AdminShellProps) {
  const user = await getCurrentEnterpriseUser();

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] border-r border-border bg-card px-4 py-5 lg:block">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-fg">
            {theme.botName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold">{theme.productName}</p>
            <p className="text-xs text-foreground-3">Enterprise workspace</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const selected = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground-2 hover:bg-surface hover:text-foreground",
                  selected && "bg-accent-soft text-accent"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
            {user ? user.role.replace(/_/g, " ") : "Signed out"}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-foreground-3">{user?.email ?? "Sign in with a staff account to access Supabase mode."}</p>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-10 border-b border-border bg-card/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 items-center rounded-full border border-border bg-surface px-3 text-sm font-semibold">
                Acme Support
              </span>
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--badge-success-border)] bg-[var(--badge-success-bg)] px-3 text-xs font-semibold text-[var(--badge-success-text)]">
                <Globe2 className="h-3.5 w-3.5" aria-hidden />
                Domain verified
              </span>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2">
              <label className="hidden h-9 min-w-[280px] max-w-md flex-1 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm text-foreground-3 md:flex">
                <Search className="h-4 w-4" aria-hidden />
                <span>Search tickets, sources, policies...</span>
              </label>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-2 hover:bg-surface" aria-label="Notifications">
                <Bell className="h-4 w-4" aria-hidden />
              </button>
              <Link href="/portal" className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-sm font-medium text-foreground-2 hover:bg-surface">
                Customer portal
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="mt-1 text-sm text-foreground-2">{description}</p>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
