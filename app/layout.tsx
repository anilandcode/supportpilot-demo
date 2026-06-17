import type { Metadata } from "next";
import { getThemeCssVariables, theme } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: `${theme.productName} - AI customer support trained on your docs`,
  description:
    "White-label AI customer support that answers from your knowledge base, cites sources, and escalates to humans when needed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme-mode={theme.mode} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" style={getThemeCssVariables()}>
        {children}
      </body>
    </html>
  );
}
