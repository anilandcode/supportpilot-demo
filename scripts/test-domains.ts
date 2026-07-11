import { addWorkspaceDomain, getDomainHealth, getWorkspaceDomainHealth, isOriginAllowed, recheckWorkspaceDomains, verifyWorkspaceDomain } from "../lib/db/support.ts";
import { DEMO_WORKSPACE_ID } from "../lib/enterprise/demo-data.ts";

const checks: Array<[string, boolean, string]> = [];

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const domain = await addWorkspaceDomain({
    workspaceId: DEMO_WORKSPACE_ID,
    domain: "https://docs.example.com/",
  });

  checks.push([
    "new custom domain starts pending with TXT record",
    domain.status === "pending" && domain.verificationRecord === "_supportpilot.docs.example.com" && Boolean(domain.verificationToken),
    `${domain.status}/${domain.verificationRecord}/${domain.verificationToken?.slice(0, 5)}`,
  ]);
  const pendingHealth = getDomainHealth(domain);
  checks.push([
    "pending domain health exposes DNS challenge",
    pendingHealth.status === "pending" && pendingHealth.expectedTxt === `supportpilot-verify=${domain.verificationToken}`,
    `${pendingHealth.status}/${pendingHealth.record}/${pendingHealth.expectedTxt?.slice(0, 10)}`,
  ]);

  const blockedBefore = await isOriginAllowed(DEMO_WORKSPACE_ID, "https://docs.example.com");
  checks.push(["pending domain is not allowed for widget traffic", !blockedBefore, String(blockedBefore)]);

  const failed = await verifyWorkspaceDomain({
    workspaceId: DEMO_WORKSPACE_ID,
    domainId: domain.id,
    resolver: {
      resolveTxt: async () => [["wrong-token"]],
      resolveCname: async () => [],
    },
  });
  checks.push([
    "wrong DNS record keeps domain pending with error",
    !failed.verified && failed.domain.status === "pending" && failed.health.status === "failing",
    `${failed.verified}/${failed.domain.status}/${failed.health.status}/${failed.domain.verificationError}`,
  ]);

  const verified = await verifyWorkspaceDomain({
    workspaceId: DEMO_WORKSPACE_ID,
    domainId: domain.id,
    resolver: {
      resolveTxt: async () => [[`supportpilot-verify=${domain.verificationToken}`]],
      resolveCname: async () => [],
    },
  });
  checks.push([
    "matching TXT record verifies domain",
    verified.verified && verified.domain.status === "verified" && verified.health.status === "healthy" && Boolean(verified.domain.verifiedAt),
    `${verified.verified}/${verified.domain.status}/${verified.health.status}/${verified.domain.verifiedAt}`,
  ]);

  verified.domain.lastCheckedAt = "2020-01-01T00:00:00.000Z";
  const staleHealth = getDomainHealth(verified.domain);
  checks.push([
    "stale verified domain is flagged for recheck",
    staleHealth.status === "stale" && staleHealth.stale,
    `${staleHealth.status}/${staleHealth.stale}`,
  ]);

  const rechecked = await recheckWorkspaceDomains({
    workspaceId: DEMO_WORKSPACE_ID,
    domainIds: [verified.domain.id],
    resolver: {
      resolveTxt: async () => [[`supportpilot-verify=${domain.verificationToken}`]],
      resolveCname: async () => [],
    },
  });
  checks.push([
    "bulk recheck refreshes stale domain health",
    rechecked.results.length === 1 && rechecked.results[0].verified && rechecked.results[0].health.status === "healthy",
    `${rechecked.results.length}/${rechecked.results[0]?.verified}/${rechecked.results[0]?.health.status}`,
  ]);

  const workspaceHealth = await getWorkspaceDomainHealth(DEMO_WORKSPACE_ID);
  checks.push([
    "workspace domain health includes configured domains",
    workspaceHealth.health.some((item) => item.domain.id === domain.id),
    String(workspaceHealth.health.length),
  ]);

  const allowedAfter = await isOriginAllowed(DEMO_WORKSPACE_ID, "https://docs.example.com");
  checks.push(["verified domain is allowed for widget traffic", allowedAfter, String(allowedAfter)]);

  const cnameDomain = await addWorkspaceDomain({
    workspaceId: DEMO_WORKSPACE_ID,
    domain: "portal.example.com",
  });
  const cnameVerified = await verifyWorkspaceDomain({
    workspaceId: DEMO_WORKSPACE_ID,
    domainId: cnameDomain.id,
    resolver: {
      resolveTxt: async () => [],
      resolveCname: async () => ["verify.supportpilot.ai."],
    },
  });
  checks.push([
    "matching CNAME target also verifies domain",
    cnameVerified.verified && cnameVerified.domain.status === "verified",
    `${cnameVerified.verified}/${cnameVerified.domain.status}/${cnameVerified.observed.join(",")}`,
  ]);

  let failedCount = 0;
  console.log("\nSupportPilot domain verification checks");
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${detail}`);
    if (!ok) failedCount++;
  }

  if (failedCount > 0) {
    console.error(`\n${failedCount} domain checks failed`);
    process.exit(1);
  }

  console.log("\nDomain verification checks passed\n");
}
