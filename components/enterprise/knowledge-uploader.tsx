"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KnowledgeUploader() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/knowledge/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setStatus(res.ok ? `Uploaded ${data.doc.title} with ${data.chunks} chunks.` : data.error ?? "Upload failed.");
    setLoading(false);
  }

  return (
    <form action={submit} className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Upload className="h-5 w-5 text-accent" aria-hidden />
        <h2 className="font-semibold">Upload approved source</h2>
      </div>
      <p className="mt-2 text-sm text-foreground-2">Upload Markdown, text, or PDF support docs, or paste a short approved source. Sources are chunked and approved for RAG.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px]">
        <input name="title" placeholder="Document title" className="h-10 rounded-xl border border-border bg-surface px-3 text-sm" />
        <select name="sourceType" defaultValue="upload" className="h-10 rounded-xl border border-border bg-surface px-3 text-sm">
          <option value="upload">Upload</option>
          <option value="faq">FAQ</option>
          <option value="product_doc">Product doc</option>
          <option value="policy">Policy</option>
          <option value="onboarding">Onboarding</option>
        </select>
        <input name="file" type="file" accept=".md,.txt,.pdf,text/*,application/pdf" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm md:col-span-2" />
        <textarea
          name="content"
          placeholder="Paste approved support text when you do not have a file."
          className="min-h-28 rounded-xl border border-border bg-surface px-3 py-2 text-sm md:col-span-2"
        />
      </div>
      <Button className="mt-4" disabled={loading}>{loading ? "Uploading..." : "Upload and ingest"}</Button>
      {status && <p className="mt-3 text-sm text-accent">{status}</p>}
    </form>
  );
}
