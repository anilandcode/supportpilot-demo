import type { UsageEventType } from "@/lib/enterprise/types";

type CaptureInput = {
  workspaceId: string;
  event: UsageEventType;
  distinctId?: string;
  properties?: Record<string, unknown>;
};

export async function captureProductEvent(input: CaptureInput) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || process.env.POSTHOG_HOST || "https://app.posthog.com";

  if (!apiKey) {
    return { skipped: true, reason: "POSTHOG_KEY not configured" };
  }

  const response = await fetch(`${host.replace(/\/$/, "")}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      event: input.event,
      distinct_id: input.distinctId || input.workspaceId,
      properties: {
        workspace_id: input.workspaceId,
        ...input.properties,
      },
    }),
  });

  return { skipped: false, ok: response.ok, status: response.status };
}
