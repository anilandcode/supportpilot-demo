import type { Metadata } from "next";
import { AcceptInviteForm } from "@/components/enterprise/accept-invite-form";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Accept invite - ${theme.productName}`,
  robots: "noindex",
};

export default async function AcceptInvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground">
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-accent">{theme.productName}</p>
        <h1 className="mt-2 text-3xl font-semibold">Join a workspace</h1>
        <p className="mt-2 text-sm text-foreground-2">Accept your role-scoped SupportPilot invitation.</p>
        <div className="mt-6">
          <AcceptInviteForm token={params.token ?? ""} />
        </div>
      </div>
    </main>
  );
}
