import type { Metadata } from "next";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { KnowledgeUploader } from "@/components/enterprise/knowledge-uploader";
import { Card } from "@/components/ui/card";
import { listDocumentChunks, listKnowledgeDocs } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Knowledge Base - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const [docs, chunks] = await Promise.all([listKnowledgeDocs(), listDocumentChunks()]);

  return (
    <AdminShell title="Knowledge base RAG" description="Approved support sources, ingestion status, chunks, and source viewer." active="/admin/knowledge">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <KnowledgeUploader />
          <Card className="rounded-2xl p-5">
            <h2 className="font-semibold">Ingestion health</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Approved docs" value={String(docs.filter((doc) => doc.approved).length)} />
              <Stat label="Chunks" value={String(chunks.length)} />
              <Stat label="Policies" value={String(docs.filter((doc) => doc.sourceType === "policy").length)} />
              <Stat label="Uploads" value={String(docs.filter((doc) => doc.sourceType === "upload").length)} />
            </dl>
          </Card>
        </div>

        <div className="space-y-4">
          {docs.map((doc) => (
            <Card key={doc.id} className="rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{doc.title}</h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-foreground-3">{doc.sourceType.replace(/_/g, " ")} · {doc.approved ? "approved" : "pending"}</p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  {chunks.filter((chunk) => chunk.docId === doc.id).length} chunks
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground-2">{doc.content.slice(0, 260)}{doc.content.length > 260 ? "..." : ""}</p>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <dt className="text-xs text-foreground-3">{label}</dt>
      <dd className="mt-1 text-xl font-semibold">{value}</dd>
    </div>
  );
}
