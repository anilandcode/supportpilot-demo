import { z } from "zod";
import { requireWorkspaceRole } from "@/lib/auth/api";
import { listEmbeddingJobs, runReembeddingJob } from "@/lib/db/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReembedSchema = z.object({
  workspaceId: z.string().optional(),
  docId: z.string().nullable().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const auth = await requireWorkspaceRole(url.searchParams.get("workspaceId") || url.searchParams.get("workspace"), ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const jobs = await listEmbeddingJobs(auth.workspaceId);
  return Response.json({ jobs });
}

export async function POST(req: Request) {
  const parsed = ReembedSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "workspaceId, docId, and limit must be valid" }, { status: 400 });

  const auth = await requireWorkspaceRole(parsed.data.workspaceId, ["owner", "admin", "manager"]);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const job = await runReembeddingJob({
    workspaceId: auth.workspaceId,
    docId: parsed.data.docId ?? null,
    limit: parsed.data.limit ?? 100,
    actorUserId: auth.userId,
  });

  return Response.json({ job }, { status: job.status === "failed" ? 500 : 202 });
}
