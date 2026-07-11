"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fff8ed", color: "#24110a", fontFamily: "Inter, system-ui, sans-serif" }}>
        <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24 }}>
          <section
            style={{
              width: "min(100%, 520px)",
              border: "1px solid rgba(36, 17, 10, 0.14)",
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 24px 80px rgba(36, 17, 10, 0.12)",
              padding: 32,
            }}
          >
            <p style={{ margin: "0 0 10px", color: "#9a5b12", fontSize: 12, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
              SupportPilot
            </p>
            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.05 }}>Something went wrong.</h1>
            <p style={{ margin: "14px 0 24px", color: "#6f625a", fontSize: 15, lineHeight: 1.6 }}>
              The workspace hit an unexpected error. The event has been captured for review when Sentry is configured.
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{
                minHeight: 44,
                border: "1px solid rgba(36, 17, 10, 0.18)",
                borderRadius: 999,
                background: "#ffd23f",
                color: "#24110a",
                cursor: "pointer",
                fontWeight: 800,
                padding: "0 18px",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
