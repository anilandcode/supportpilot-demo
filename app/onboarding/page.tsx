import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/enterprise/onboarding-wizard";
import { getWorkspaceLaunchState } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Onboarding - ${theme.productName}`,
  robots: "noindex",
};

export default async function OnboardingPage() {
  const launchState = await getWorkspaceLaunchState();

  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{theme.productName}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Live-in-24h onboarding</h1>
            <p className="mt-3 max-w-2xl text-sm text-foreground-2">
              Create the workspace, add approved sources, configure brand and policy, verify the widget domain, test golden questions, then go live.
            </p>
          </div>
          <a href="/admin/settings" className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted">
            Settings
          </a>
        </div>
        <OnboardingWizard launchState={launchState} />
      </div>
    </main>
  );
}
