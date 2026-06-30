import { addWorkspaceDomain, isOriginAllowed, verifyWorkspaceDomain } from "../lib/db/support.ts";
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
    !failed.verified && failed.domain.status === "pending" && Boolean(failed.domain.verificationError),
    `${failed.verified}/${failed.domain.status}/${failed.domain.verificationError}`,
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
    verified.verified && verified.domain.status === "verified" && Boolean(verified.domain.verifiedAt),
    `${verified.verified}/${verified.domain.status}/${verified.domain.verifiedAt}`,
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
