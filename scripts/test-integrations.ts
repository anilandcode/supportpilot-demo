import {
  deliverOutboundEvent,
  enqueueApprovalDecision,
  enqueueApprovalRequested,
  getIntegrationHealth,
  getLocalIntegrationState,
  resetLocalIntegrationStateForTests,
  upsertIntegrationAccount,
  upsertWebhookEndpoint,
} from "../lib/db/integrations.ts";
import { DEMO_TENANT_ID, DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";
import type { AIRun } from "../lib/enterprise/types.ts";
import { sendInvitationEmail } from "../lib/integrations/resend.ts";

const checks: Array<[string, boolean, string]> = [];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  resetLocalIntegrationStateForTests();
  delete process.env.SUPPORTPILOT_INTEGRATION_DELIVERY_MODE;

  const aiRun = fakeAiRun("escalated");
  const withoutChannels = await enqueueApprovalRequested(aiRun);
  checks.push(["no integration config creates no outbound events", withoutChannels.length === 0, String(withoutChannels.length)]);

  await upsertIntegrationAccount({
    workspaceId: DEMO_WORKSPACE_ID,
    provider: "slack",
    name: "Support channel",
    status: "active",
    config: { webhookUrl: "https://hooks.slack.test/support", events: ["approval_needed", "approved_reply"] },
  });
  await upsertWebhookEndpoint({
    workspaceId: DEMO_WORKSPACE_ID,
    name: "Ops webhook",
    url: "https://hooks.example.test/supportpilot",
    status: "active",
    events: ["approval_needed", "approved_reply"],
  });

  const requested = await enqueueApprovalRequested(aiRun);
  const requestedAgain = await enqueueApprovalRequested(aiRun);
  checks.push(["approval-needed enqueues one event per active channel", requested.length === 2, String(requested.length)]);
  checks.push([
    "approval-needed enqueue is idempotent per channel",
    requestedAgain.length === 2 && getLocalIntegrationState().outboundEvents.length === 2,
    String(getLocalIntegrationState().outboundEvents.length),
  ]);

  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; body: string; signature: string | null }> = [];
  globalThis.fetch = (async (input, init) => {
    calls.push({
      url: String(input),
      body: String(init?.body ?? ""),
      signature: new Headers(init?.headers).get("X-SupportPilot-Signature"),
    });
    return new Response("ok", { status: 200 });
  }) as typeof fetch;

  const slackResult = await deliverOutboundEvent(requested.find((event) => event.integrationAccountId)?.id ?? requested[0].id);
  checks.push([
    "Slack delivery marks event delivered",
    slackResult.event.status === "delivered" && slackResult.delivery.status === "delivered" && calls[0]?.url === "https://hooks.slack.test/support",
    `${slackResult.event.status}/${calls[0]?.url}`,
  ]);
  checks.push(["Slack delivery uses Slack block payload", calls[0]?.body.includes("\"blocks\"") && calls[0]?.body.includes("approval needed"), calls[0]?.body.slice(0, 80)]);

  process.env.TEST_SUPPORTPILOT_WEBHOOK_SECRET = "top-secret";
  const signedEndpoint = await upsertWebhookEndpoint({
    workspaceId: DEMO_WORKSPACE_ID,
    name: "Signed endpoint",
    url: "https://signed.example.test/supportpilot",
    signingSecretRef: "TEST_SUPPORTPILOT_WEBHOOK_SECRET",
    status: "active",
    events: ["approved_reply"],
  });
  const approvedRun = fakeAiRun("approved");
  const approvedEvents = await enqueueApprovalDecision(approvedRun);
  const signedEvent = approvedEvents.find((event) => event.webhookEndpointId === signedEndpoint.id);
  const signedResult = signedEvent ? await deliverOutboundEvent(signedEvent.id) : null;
  checks.push([
    "generic webhook delivery signs payload when secret ref is configured",
    Boolean(signedResult && signedResult.event.status === "delivered" && calls.some((call) => call.url === signedEndpoint.url && call.signature?.startsWith("t="))),
    calls.map((call) => `${call.url}:${call.signature ?? "none"}`).join(" | "),
  ]);

  globalThis.fetch = (async () => new Response("bad gateway", { status: 502 })) as typeof fetch;
  const failingEndpoint = await upsertWebhookEndpoint({
    workspaceId: DEMO_WORKSPACE_ID,
    name: "Failing endpoint",
    url: "https://failing.example.test/supportpilot",
    status: "active",
    events: ["approved_reply"],
  });
  const failedEvents = await enqueueApprovalDecision(fakeAiRun("approved", crypto.randomUUID()));
  const failedEvent = failedEvents.find((event) => event.webhookEndpointId === failingEndpoint.id);
  const failedResult = failedEvent ? await deliverOutboundEvent(failedEvent.id) : null;
  checks.push([
    "failed delivery returns to queued with retry metadata",
    Boolean(failedResult && failedResult.event.status === "queued" && failedResult.event.nextRunAt && failedResult.delivery.status === "failed" && failedResult.delivery.httpStatus === 502),
    `${failedResult?.event.status}/${failedResult?.event.nextRunAt}/${failedResult?.delivery.httpStatus}`,
  ]);
  const healthAfterFailure = await getIntegrationHealth(DEMO_WORKSPACE_ID, new Date(Date.now() + 60_000));
  checks.push([
    "integration health surfaces queued retries and delivery failures",
    healthAfterFailure.status === "degraded" &&
      healthAfterFailure.channels.activeAccounts === 1 &&
      healthAfterFailure.channels.activeWebhookEndpoints >= 3 &&
      healthAfterFailure.events.queued >= 1 &&
      healthAfterFailure.events.retryDue >= 1 &&
      healthAfterFailure.deliveries.failed >= 1 &&
      healthAfterFailure.deliveries.successRate < 1,
    `${healthAfterFailure.status}/${healthAfterFailure.events.queued}/${healthAfterFailure.deliveries.successRate}`,
  ]);

  globalThis.fetch = originalFetch;
  delete process.env.TEST_SUPPORTPILOT_WEBHOOK_SECRET;

  const originalResendKey = process.env.RESEND_API_KEY;
  const originalInviteFrom = process.env.INVITATION_FROM_EMAIL;
  delete process.env.RESEND_API_KEY;
  delete process.env.INVITATION_FROM_EMAIL;
  const skippedInviteEmail = await sendInvitationEmail({
    to: "new-agent@example.com",
    role: "agent",
    workspaceName: "AcmeDesk Support",
    inviteUrl: "https://supportpilot.example/invite/accept?token=token_test",
  });
  checks.push([
    "invitation email is a safe no-op without Resend",
    skippedInviteEmail.skipped && skippedInviteEmail.reason === "RESEND_API_KEY not configured",
    `${skippedInviteEmail.skipped}/${skippedInviteEmail.reason}`,
  ]);

  const resendCalls: Array<{ url: string; body: any; authorization: string | null }> = [];
  process.env.RESEND_API_KEY = "resend_test_key";
  process.env.INVITATION_FROM_EMAIL = "SupportPilot Invites <invites@example.com>";
  globalThis.fetch = (async (input, init) => {
    resendCalls.push({
      url: String(input),
      body: JSON.parse(String(init?.body ?? "{}")),
      authorization: new Headers(init?.headers).get("Authorization"),
    });
    return Response.json({ id: "email_invite_test" }, { status: 200 });
  }) as typeof fetch;
  const sentInviteEmail = await sendInvitationEmail({
    to: "manager@example.com",
    role: "manager",
    workspaceName: "AcmeDesk Support",
    inviteUrl: "https://supportpilot.example/invite/accept?token=token_test",
  });
  checks.push([
    "invitation email sends through Resend with invite copy",
    !sentInviteEmail.skipped &&
      sentInviteEmail.ok === true &&
      sentInviteEmail.id === "email_invite_test" &&
      resendCalls[0]?.url === "https://api.resend.com/emails" &&
      resendCalls[0]?.authorization === "Bearer resend_test_key" &&
      resendCalls[0]?.body.subject.includes("AcmeDesk Support") &&
      resendCalls[0]?.body.html.includes("Accept your invitation"),
    `${sentInviteEmail.ok}/${sentInviteEmail.id}/${resendCalls[0]?.body.subject}`,
  ]);
  globalThis.fetch = originalFetch;
  restoreEnv("RESEND_API_KEY", originalResendKey);
  restoreEnv("INVITATION_FROM_EMAIL", originalInviteFrom);

  let failed = 0;
  console.log("\nSupportPilot integration checks");
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) failed++;
  }

  if (failed > 0) {
    console.error(`\n${failed} integration checks failed`);
    process.exit(1);
  }

  console.log("\nIntegration checks passed\n");
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function fakeAiRun(status: AIRun["approvalStatus"], id = crypto.randomUUID()): AIRun {
  return {
    id,
    tenantId: DEMO_TENANT_ID,
    workspaceId: DEMO_WORKSPACE_ID,
    ticketId: "tkt_002",
    userId: "usr_manager_lena",
    prompt: "redacted prompt",
    promptHash: "hash_test",
    redactedPromptPreview: "redacted prompt",
    response: "Approved response with cited refund policy.",
    model: "deterministic",
    provider: "local",
    modelRoute: "R4",
    latencyMs: 120,
    inputTokens: 10,
    outputTokens: 12,
    costEstimateUsd: 0.001,
    confidence: 0.82,
    retrievalScore: 0.9,
    generationScore: 0.8,
    policyRiskScore: 0.7,
    groundingStatus: "pass",
    groundingScore: 0.88,
    approvalStatus: status,
    escalationReason: status === "escalated" ? "Refund policy risk requires manager review" : null,
    riskFlags: ["billing_or_refund"],
    sources: [{ source: "Refund Policy#Refunds", docId: "doc_refunds", chunkId: "chk_refunds", score: 0.9 }],
    rationale: "Test run for integration delivery.",
    createdAt: new Date().toISOString(),
  };
}
