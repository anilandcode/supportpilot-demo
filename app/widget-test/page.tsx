import type { Metadata } from "next";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `${theme.productName} widget test`,
  robots: "noindex",
};

export default function WidgetTestPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-950">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Widget test</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Blank host page</h1>
        <p className="mt-4 text-slate-600">
          This page loads the same async script that a client would paste into Webflow, WordPress, Shopify, or plain HTML.
        </p>
      </div>
      <script async src="/widget.js" data-accent={theme.colors.accent} />
    </main>
  );
}
