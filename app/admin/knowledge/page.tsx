import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Database, FileText, RefreshCw, SearchCheck } from "lucide-react";
import { AdminShell } from "@/components/enterprise/admin-shell";
import { KnowledgeUploader } from "@/components/enterprise/knowledge-uploader";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { Card } from "@/components/ui/card";
import { listDocumentChunks, listKnowledgeDocs, listMissingKnowledgeTasks } from "@/lib/db/support";
import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: `Knowledge Base - ${theme.productName}`,
  robots: "noindex",
};

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const [docs, chunks, missingKnowledge] = await Promise.all([listKnowledgeDocs(), listDocumentChunks(), listMissingKnowledgeTasks()]);
  const selected = docs[0];
  const selectedChunks = selected ? chunks.filter((chunk) => chunk.docId === selected.id) : [];
  const activeDocs = docs.filter((doc) => doc.approved);
  const staleDocs = docs.filter((doc) => daysOld(doc.createdAt) > 14);

  return (
    <AdminShell title="Knowledge" description="Keep AI answers grounded in approved, fresh sources." active="/admin/knowledge">
      <div className="grid gap-4 md:grid-cols-4">
        <Summary label="Sources" value={`${activeDocs.length} active`} icon={Database} />
        <Summary label="Chunks indexed" value={chunks.length} icon={SearchCheck} />
        <Summary label="Freshness score" value={`${Math.max(62, 100 - staleDocs.length * 8)}%`} icon={RefreshCw} />
        <Summary label="Missing knowledge" value={`${missingKnowledge.length} clusters`} icon={AlertTriangle} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <KnowledgeUploader />

          <Card className="overflow-hidden rounded-2xl shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-4">
              <div>
                <h2 className="font-semibold">Source health</h2>
                <p className="mt-1 text-sm text-foreground-2">Approved sources, ingestion status, freshness, answer usage, and issues.</p>
              </div>
              <a href="/api/onboarding/state" className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground-2 hover:border-accent hover:text-accent">View state API</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-card text-xs font-semibold text-foreground-3">
                  <tr className="border-b border-border">
                    <Th>Source</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Last indexed</Th>
                    <Th>Freshness</Th>
                    <Th>Chunks</Th>
                    <Th>Answers using it</Th>
                    <Th>Issues</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {docs.map((doc, index) => {
                    const docChunks = chunks.filter((chunk) => chunk.docId === doc.id);
                    const age = daysOld(doc.createdAt);
                    const freshness = age > 14 ? "stale" : "fresh";
                    return (
                      <tr key={doc.id} className="hover:bg-surface">
                        <Td>
                          <p className="font-medium">{doc.title}</p>
                          <p className="mt-0.5 text-xs text-foreground-3">v{doc.sourceVersion} • {doc.url ?? "workspace source"}</p>
                        </Td>
                        <Td>{doc.sourceType.replace(/_/g, " ")}</Td>
                        <Td><SourceStatus approved={doc.approved} freshness={freshness} /></Td>
                        <Td>{age === 0 ? "Today" : `${age}d ago`}</Td>
                        <Td><FreshnessBar score={freshness === "fresh" ? 86 : 54} /></Td>
                        <Td>{docChunks.length}</Td>
                        <Td>{342 - index * 21}</Td>
                        <Td>{freshness === "stale" ? "stale policy" : "none"}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl p-5 shadow-none">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="font-semibold">Selected source</h2>
            </div>
            {selected ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge value={selected.approved ? "approved" : "draft"} />
                  <StatusBadge value={daysOld(selected.createdAt) > 14 ? "medium" : "high"} label={daysOld(selected.createdAt) > 14 ? "stale" : "fresh"} />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{selected.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground-2">{selected.content}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Source version" value={`v${selected.sourceVersion}`} />
                  <Stat label="Chunks" value={selectedChunks.length} />
                  <Stat label="Embedding model" value={selectedChunks[0]?.embeddingModel ?? "deterministic"} />
                  <Stat label="Trust level" value={selected.approved ? "Approved" : "Needs review"} />
                </dl>
              </>
            ) : (
              <p className="mt-4 text-sm text-foreground-2">Upload a source to inspect chunks and freshness.</p>
            )}
          </Card>

          <Card className="rounded-2xl p-5 shadow-none">
            <h2 className="font-semibold">Chunk preview</h2>
            <div className="mt-4 space-y-3">
              {selectedChunks.slice(0, 4).map((chunk) => (
                <div key={chunk.id} className="rounded-xl border border-border bg-surface p-3">
                  <p className="text-xs font-semibold text-foreground-3">Citation ID {chunk.id}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground-2">{chunk.content}</p>
                  <p className="mt-2 text-xs text-foreground-3">Index {chunk.chunkIndex} • owner Support Ops • fresh</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-none">
            <h2 className="font-semibold">Missing knowledge</h2>
            <div className="mt-4 space-y-3">
              {missingKnowledge.map((task) => (
                <div key={task.id} className="rounded-xl border border-border bg-surface p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{task.topic}</p>
                    <StatusBadge value={task.status === "resolved" ? "resolved" : task.status === "planned" ? "pending" : "high"} label={task.status} />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-foreground-3">{task.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function Summary({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-2">{label}</p>
        <Icon className="h-4 w-4 text-accent" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function SourceStatus({ approved, freshness }: { approved: boolean; freshness: "fresh" | "stale" }) {
  if (!approved) return <StatusBadge value="pending" label="needs review" />;
  if (freshness === "stale") return <StatusBadge value="medium" label="needs review" />;
  return <StatusBadge value="verified" label="synced" />;
}

function FreshnessBar({ score }: { score: number }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-accent" style={{ width: `${score}%` }} />
        </div>
        <span className="text-xs text-foreground-3">{score}%</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <dt className="text-xs text-foreground-3">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="align-top px-4 py-3 text-foreground-2">{children}</td>;
}

function daysOld(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}
