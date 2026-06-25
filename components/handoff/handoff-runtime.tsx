"use client";

import { useEffect } from "react";

export type HandoffPageKey = "overview" | "conversations" | "knowledge" | "approvals" | "analytics" | "settings" | "portal";

type AnyRecord = Record<string, any>;

type HandoffRuntimeProps = {
  pageKey: HandoffPageKey;
  data: AnyRecord;
};

export function HandoffRuntime({ pageKey, data }: HandoffRuntimeProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      hydrateCommon(data);
      if (pageKey === "overview") hydrateOverview(data);
      if (pageKey === "conversations") hydrateConversations(data);
      if (pageKey === "knowledge") hydrateKnowledge(data);
      if (pageKey === "approvals") hydrateApprovals(data);
      if (pageKey === "analytics") hydrateAnalytics(data);
      if (pageKey === "settings") hydrateSettings(data);
      if (pageKey === "portal") hydratePortal(data);
    }, 40);

    return () => window.clearTimeout(timer);
  }, [pageKey, data]);

  return null;
}

function q<T extends Element = HTMLElement>(selector: string) {
  return document.querySelector<T>(selector);
}

function qa<T extends Element = HTMLElement>(selector: string) {
  return Array.from(document.querySelectorAll<T>(selector));
}

function setText(selector: string, value: unknown) {
  const node = q(selector);
  if (node) node.textContent = String(value ?? "");
}

function setHtml(selector: string, value: string) {
  const node = q(selector);
  if (node) node.innerHTML = value;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ticketCode(id: string) {
  return `#${id.replace(/^tkt_0*/, "T-").replace(/^tkt_/, "T-")}`;
}

function formatAge(value?: string) {
  if (!value) return "just now";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function riskClass(value?: string) {
  if (value === "critical" || value === "high") return "high";
  if (value === "medium") return "normal";
  return "low";
}

function confidenceLabel(value: number) {
  if (value >= 0.82) return "High confidence";
  if (value >= 0.62) return "Needs review";
  return "Low confidence";
}

function hydrateCommon(data: AnyRecord) {
  const workspace = data.workspace || data.launchState?.workspace || data.ticket?.workspace;
  if (!workspace) return;
  qa(".header-title").forEach((node) => {
    node.textContent = workspace.name || "Acme Support";
  });
}

function hydrateOverview(data: AnyRecord) {
  const metrics = data.metrics || {};
  const launch = data.launchState || {};
  const health = launch.health || {};
  const checklist = launch.checklist || [];

  setText("#summary-launch-text", health.launchReady ? "Ready" : "Setup");
  setText("#summary-checklist-val", `${health.checklistCompleted ?? 0}/${health.checklistTotal ?? checklist.length}`);
  setText("#checklist-remaining-badge", `${Math.max(0, (health.checklistTotal ?? checklist.length) - (health.checklistCompleted ?? 0))} left`);

  const summaryValues = qa(".summary-grid .summary-value");
  if (summaryValues[2]) summaryValues[2].textContent = String(health.approvedSources ?? 0);
  if (summaryValues[3]) summaryValues[3].textContent = String(health.verifiedDomains ?? 0);
  if (summaryValues[4]) summaryValues[4].textContent = String(health.openApprovals ?? 0);

  setText(".metric-card.tickets .metric-value", metrics.totalTickets ?? 0);
  setText(".metric-card.resolved .metric-value", metrics.resolvedTickets ?? 0);
  setText(".metric-card.escalated .metric-value", metrics.escalatedTickets ?? 0);
  setText(".metric-card.escalated .metric-caption", `${metrics.escalationRate ?? 0}% escalation rate`);
  setText(".metric-card.acceptance .metric-value", `${metrics.acceptanceRate ?? 0}%`);
  setText(".metric-card.acceptance .metric-caption", `$${metrics.costPerAcceptedReply ?? 0}/accepted reply`);

  const items = qa<HTMLElement>(".checklist-item");
  items.forEach((item, index) => {
    const source = checklist[index];
    if (!source) return;
    item.dataset.step = source.step;
    item.classList.toggle("checked", Boolean(source.completed));
    const title = item.querySelector("b");
    const desc = item.querySelector("span");
    if (title) title.textContent = source.label;
    if (desc) desc.textContent = source.description;
    item.addEventListener("click", () => {
      window.setTimeout(async () => {
        item.classList.add("checked");
        updateChecklistSummary();
        if (item.dataset.step) {
          await fetch(`/api/onboarding/steps/${encodeURIComponent(item.dataset.step)}/complete`, { method: "POST" }).catch(() => null);
        }
      }, 0);
    });
  });
  updateChecklistSummary();

  const topics = metrics.missingTopics?.length ? metrics.missingTopics : launch.missingKnowledge?.map((task: AnyRecord) => ({ topic: task.topic, count: 1 }));
  if (topics?.length) {
    setHtml(
      ".topic-list",
      topics.slice(0, 3).map((topic: AnyRecord, index: number) => `
        <div class="topic-item">
          <span class="topic-badge">${index + 1}</span>
          <div class="topic-info">
            <b>${escapeHtml(topic.topic)}</b>
            <span>${escapeHtml(topic.count ?? 1)} ticket${Number(topic.count ?? 1) === 1 ? "" : "s"} · Knowledge gap</span>
          </div>
          <div class="topic-actions"><a href="/admin/knowledge">Add source</a></div>
        </div>
      `).join(""),
    );
  }
}

function updateChecklistSummary() {
  const total = qa(".checklist-item").length;
  const checked = qa(".checklist-item.checked").length;
  setText("#summary-checklist-val", `${checked}/${total}`);
  setText("#checklist-remaining-badge", `${Math.max(0, total - checked)} left`);
  setText("#summary-launch-text", checked === total ? "Ready" : "Setup");
}

function hydrateConversations(data: AnyRecord) {
  const ticket = data.ticket;
  if (!ticket) return;
  let activeAiRun = ticket.latestAiRun || null;

  setText(".ticket-id", ticketCode(ticket.id));
  setText(".status-badge", ticket.status?.replace(/_/g, " ") || "Open");
  setText("#quality-val", `${Math.round((activeAiRun?.confidence ?? 0.72) * 100)}%`);
  setText("#quality-label", confidenceLabel(activeAiRun?.confidence ?? 0.72));
  const qualityBar = q<HTMLElement>("#quality-bar");
  if (qualityBar) qualityBar.style.width = `${Math.round((activeAiRun?.confidence ?? 0.72) * 100)}%`;
  const risk = q<HTMLElement>("#risk-val");
  if (risk) {
    risk.textContent = ticket.riskLevel || "low";
    risk.className = `status-pill-small ${riskClass(ticket.riskLevel)}`;
  }
  setText("#class-val", ticket.tags?.[0]?.replace(/_/g, " ") || "support");
  setText(".customer-name", ticket.customer?.company || "Customer");
  setText(".customer-domain", ticket.customer?.email || ticket.customer?.company || "");

  const flow = q("#chat-flow-viewport");
  if (flow) {
    flow.innerHTML = [
      ...(ticket.messages || []).map((message: AnyRecord) => renderConversationMessage(message)),
      activeAiRun ? renderAiRunMessage(activeAiRun) : "",
    ].join("");
    flow.scrollTop = flow.scrollHeight;
  }
  updateApprovalAlert(ticket, activeAiRun);

  const form = q<HTMLFormElement>("#composer-form");
  const input = q<HTMLInputElement>("#composer-input");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const body = input?.value.trim();
    if (!body) return;
    if (input) input.value = "";
    appendConversationBubble("agent", body);
    await fetch(`/api/tickets/${encodeURIComponent(ticket.id)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "agent", body }),
    }).catch(() => null);
  }, true);

  const assistButton = q<HTMLButtonElement>(".composer-btn[aria-label='Use Assistant assist']");
  assistButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    assistButton.disabled = true;
    const result = await fetch(`/api/tickets/${encodeURIComponent(ticket.id)}/draft`, { method: "POST" }).then((res) => res.json()).catch(() => null);
    assistButton.disabled = false;
    if (!result?.draft) return;
    activeAiRun = result.aiRun;
    appendConversationBubble("ai", result.draft, result.citations || result.aiRun?.sources || []);
    setText("#quality-val", `${Math.round((result.confidence ?? result.aiRun?.confidence ?? 0) * 100)}%`);
    setText("#quality-label", confidenceLabel(result.confidence ?? result.aiRun?.confidence ?? 0));
    if (qualityBar) qualityBar.style.width = `${Math.round((result.confidence ?? result.aiRun?.confidence ?? 0) * 100)}%`;
    updateApprovalAlert(ticket, activeAiRun);
  }, true);

  q<HTMLButtonElement>(".btn-evidence")?.addEventListener("click", async () => {
    if (!activeAiRun?.id) return;
    await fetch(`/api/ai-runs/${encodeURIComponent(activeAiRun.id)}/decision`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "approved", finalResponse: activeAiRun.response }),
    }).catch(() => null);
    setText(".btn-evidence", "Approval logged");
  });
}

function renderConversationMessage(message: AnyRecord) {
  const role = message.sender === "customer" ? "customer" : "ai";
  const avatar = message.sender === "customer" ? "C" : message.sender === "agent" ? "A" : "P";
  const name = message.sender === "customer" ? "Customer" : message.sender === "agent" ? "Agent" : "SupportPilot";
  return `
    <div class="message-row ${role}">
      <div class="msg-avatar">${avatar}</div>
      <div class="bubble-wrapper">
        <div class="msg-sender-header"><span class="sender-name">${name}</span></div>
        <div class="msg-bubble">${escapeHtml(message.body)}</div>
      </div>
    </div>`;
}

function renderAiRunMessage(run: AnyRecord) {
  return `
    <div class="message-row ai" id="ai-answer-message">
      <div class="msg-avatar">P</div>
      <div class="bubble-wrapper">
        <div class="msg-sender-header"><span class="sender-name">SupportPilot</span><span class="ai-badge">AI Answer</span></div>
        <div class="msg-bubble">
          ${escapeHtml(run.response)}
          ${renderCitations(run.sources || [])}
        </div>
      </div>
    </div>`;
}

function renderCitations(sources: AnyRecord[]) {
  if (!sources.length) return "";
  return `<div class="citations-box">${sources.slice(0, 4).map((source) => `
    <a href="#source" class="citation-card">
      <div class="citation-left">
        <span class="citation-dot"></span>
        <span class="citation-title">${escapeHtml(source.source || "Approved source")}</span>
        <span class="citation-url">${Math.round(Number(source.score ?? 0) * 100)}% match</span>
      </div>
      <span class="citation-arrow">›</span>
    </a>
  `).join("")}</div>`;
}

function appendConversationBubble(sender: "agent" | "ai", body: string, citations: AnyRecord[] = []) {
  const flow = q("#chat-flow-viewport");
  if (!flow) return;
  flow.insertAdjacentHTML("beforeend", sender === "ai" ? renderAiRunMessage({ response: body, sources: citations }) : renderConversationMessage({ sender, body }));
  flow.scrollTop = flow.scrollHeight;
}

function updateApprovalAlert(ticket: AnyRecord, run: AnyRecord | null) {
  const alert = q("#approval-alert");
  if (!alert) return;
  const risky = ticket.riskLevel === "high" || ticket.riskLevel === "critical" || run?.approvalStatus === "escalated";
  alert.innerHTML = risky
    ? `<b>Approval required</b><span>${escapeHtml(ticket.escalationReason || run?.escalationReason || "Risk policy matched for this conversation.")}</span>`
    : `<b>No approval required</b><span>Answer is safe to send. No manual compliance bypass needed.</span>`;
}

function hydrateKnowledge(data: AnyRecord) {
  const docs = data.docs || [];
  const chunks = data.chunks || [];
  const domains = data.domains || [];
  const domainLabel = domains.find((domain: AnyRecord) => domain.status === "verified")?.domain || "approved domain";
  const body = q("#source-list-body");
  if (!body) return;
  body.innerHTML = docs.map((doc: AnyRecord, index: number) => {
    const docChunks = chunks.filter((chunk: AnyRecord) => chunk.docId === doc.id);
    return `
      <tr class="${index === 0 ? "active" : ""}" data-source="${escapeHtml(doc.id)}">
        <td><div class="source-name-cell"><div class="source-icon">☷</div><div><div class="source-name">${escapeHtml(doc.title)}</div><div class="source-meta">${escapeHtml(doc.url || doc.sourceType)} · ${formatAge(doc.createdAt)}</div></div></div></td>
        <td><span class="badge-status ${doc.approved ? "indexed" : "pending"}">${doc.approved ? "Indexed" : "Pending"}</span></td>
        <td><b>${docChunks.length}</b></td>
        <td><code>${escapeHtml(domainLabel)}</code></td>
      </tr>`;
  }).join("");

  const renderInspector = (docId: string) => {
    const doc = docs.find((item: AnyRecord) => item.id === docId) || docs[0];
    if (!doc) return;
    const docChunks = chunks.filter((chunk: AnyRecord) => chunk.docId === doc.id);
    setText("#inspector-source-title", doc.title);
    setText("#inspector-source-meta", `${docChunks.length} active vector chunks · Grounded on ${domainLabel}`);
    setHtml("#chunk-list-container", docChunks.slice(0, 8).map((chunk: AnyRecord) => `
      <div class="chunk-card">
        <div class="chunk-meta"><span>CHUNK #${String(chunk.chunkIndex + 1).padStart(2, "0")} · VECTOR ID: ${escapeHtml(chunk.id)}</span><span style="color: var(--success);">MATCH WEIGHT: ${Number(chunk.score ?? 0.86).toFixed(2)}</span></div>
        <div class="chunk-text">${escapeHtml(chunk.content)}</div>
      </div>
    `).join(""));
  };

  qa<HTMLElement>("#source-list-body tr").forEach((row) => {
    row.addEventListener("click", () => {
      qa("#source-list-body tr").forEach((item) => item.classList.remove("active"));
      row.classList.add("active");
      renderInspector(row.dataset.source || "");
    });
  });
  renderInspector(docs[0]?.id);

  q<HTMLButtonElement>("#btn-submit-modal")?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const title = q<HTMLInputElement>("#input-title")?.value.trim() || "Dashboard uploaded source";
    const sourceType = q<HTMLSelectElement>("#input-source-type")?.value === "url" ? "product_doc" : "upload";
    const form = new FormData();
    form.set("title", title);
    form.set("sourceType", sourceType);
    form.set("content", `${title}\n\nApproved support source added from the SupportPilot knowledge dashboard prototype.`);
    const button = q<HTMLButtonElement>("#btn-submit-modal");
    if (button) button.textContent = "Ingesting...";
    await fetch("/api/knowledge/upload", { method: "POST", body: form }).catch(() => null);
    window.location.reload();
  }, true);
}

function hydrateApprovals(data: AnyRecord) {
  const approvals = data.approvals || [];
  const queue = q("#queue-container");
  let selected = approvals[0] || null;
  if (!queue) return;
  setText("#queue-count", approvals.length);
  queue.innerHTML = approvals.map((run: AnyRecord, index: number) => `
    <div class="queue-card ${index === 0 ? "active" : ""}" data-ticket="${escapeHtml(run.id)}">
      <div class="card-top"><span class="ticket-id">${ticketCode(run.ticketId || run.id)}</span><span class="badge-status ${riskClass((run.policyRiskScore ?? 0) >= 0.75 ? "high" : "medium")}">${(run.policyRiskScore ?? 0) >= 0.75 ? "High Risk" : "Review"}</span></div>
      <div class="card-query">${escapeHtml(run.redactedPromptPreview || run.prompt)}</div>
      <div class="card-meta">${escapeHtml(run.rationale || "Approval required")} · ${formatAge(run.createdAt)}</div>
    </div>
  `).join("");

  const renderReview = (run: AnyRecord) => {
    selected = run;
    setText("#review-ticket-id", `Review Suggested Reply ${ticketCode(run.ticketId || run.id)}`);
    const risk = q("#review-ticket-risk");
    if (risk) {
      risk.textContent = (run.policyRiskScore ?? 0) >= 0.75 ? "High Risk" : "Review";
      risk.className = `badge-status ${riskClass((run.policyRiskScore ?? 0) >= 0.75 ? "high" : "medium")}`;
    }
    setText("#review-query-text", run.redactedPromptPreview || run.prompt);
    const editor = q<HTMLTextAreaElement>("#reply-editor");
    if (editor) {
      editor.value = run.response || "";
      editor.readOnly = true;
    }
    setText("#review-confidence", `${Math.round((run.confidence ?? 0) * 100)}%`);
    setText("#review-sources-count", `${run.sources?.length ?? 0} Sources`);
    setHtml("#review-citations-container", (run.sources || []).map((source: AnyRecord) => `
      <div class="citation-item"><div class="citation-left"><span class="citation-dot"></span><span class="citation-name">${escapeHtml(source.source || "Approved source")}</span></div><span class="citation-weight">${Number(source.score ?? 0).toFixed(2)} weight</span></div>
    `).join("") || `<div class="citation-item"><div class="citation-left"><span class="citation-dot"></span><span class="citation-name">No citations attached</span></div><span class="citation-weight">needs review</span></div>`);
  };

  qa<HTMLElement>(".queue-card").forEach((card) => {
    card.addEventListener("click", () => {
      qa(".queue-card").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      renderReview(approvals.find((run: AnyRecord) => run.id === card.dataset.ticket) || approvals[0]);
    });
  });
  if (selected) renderReview(selected);

  q<HTMLButtonElement>("#btn-edit-toggle")?.addEventListener("click", () => {
    const editor = q<HTMLTextAreaElement>("#reply-editor");
    if (!editor) return;
    editor.readOnly = !editor.readOnly;
    setText("#btn-edit-toggle", editor.readOnly ? "Edit Answer" : "Lock Edit");
  });
  q<HTMLButtonElement>("#btn-approve-send")?.addEventListener("click", (event) => decideApproval(event, "approved", () => selected), true);
  q<HTMLButtonElement>("#btn-reject-reply")?.addEventListener("click", (event) => decideApproval(event, "rejected", () => selected), true);
}

async function decideApproval(event: Event, decision: "approved" | "rejected", getRun: () => AnyRecord | null) {
  event.preventDefault();
  event.stopImmediatePropagation();
  const run = getRun();
  if (!run) return;
  const finalResponse = q<HTMLTextAreaElement>("#reply-editor")?.value || run.response;
  await fetch(`/api/ai-runs/${encodeURIComponent(run.id)}/decision`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, finalResponse }),
  }).catch(() => null);
  q<HTMLElement>(`.queue-card[data-ticket="${CSS.escape(run.id)}"]`)?.remove();
  const remaining = qa(".queue-card");
  setText("#queue-count", remaining.length);
  (remaining[0] as HTMLElement | undefined)?.click();
}

function hydrateAnalytics(data: AnyRecord) {
  const metrics = data.metrics || {};
  const cards = qa(".metrics-grid .metric-card");
  const deflection = Math.max(0, 100 - Number(metrics.escalationRate ?? 0));
  if (cards[0]) cards[0].querySelector(".metric-value")!.textContent = `${deflection}%`;
  if (cards[1]) cards[1].querySelector(".metric-value")!.textContent = `$${Math.round((metrics.resolvedTickets ?? 0) * 12.5)}`;
  if (cards[2]) cards[2].querySelector(".metric-value")!.textContent = `${metrics.responseTimeMinutes ?? 2}s`;
  if (cards[3]) cards[3].querySelector(".metric-value")!.textContent = `${Math.max(4.2, Math.min(5, 4 + Number(metrics.acceptanceRate ?? 0) / 100)).toFixed(2)}`;

  const topics = metrics.missingTopics?.length ? metrics.missingTopics : metrics.topQuestions || [];
  const total = topics.reduce((sum: number, item: AnyRecord) => sum + Number(item.count ?? 1), 0) || 1;
  setHtml(".category-list", topics.slice(0, 4).map((topic: AnyRecord, index: number) => {
    const pct = Math.round((Number(topic.count ?? 1) / total) * 100);
    return `
      <div class="category-item">
        <div class="category-top"><span class="category-name">${escapeHtml(topic.topic || topic.question)}</span><span class="category-percentage">${pct}% (${escapeHtml(topic.count ?? 1)} tickets)</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;${index === 1 ? "background: var(--periwinkle);" : ""}"></div></div>
      </div>`;
  }).join(""));
}

function hydrateSettings(data: AnyRecord) {
  const launch = data.launchState || {};
  const workspace = launch.workspace || data.workspace || {};
  const domains = launch.domains || [];
  const snippet = `<script src="${data.publicBaseUrl || "https://supportpilot-demo.vercel.app"}/widget.js" data-id="${workspace.widgetKey}" data-theme="warm" async><\\/script>`;

  const nameInput = q<HTMLInputElement>("#assistant-name-input");
  if (nameInput) nameInput.value = workspace.botName || "SupportPilot Agent";
  const keyInput = q<HTMLInputElement>("#apikey-input");
  if (keyInput) keyInput.value = workspace.widgetKey || "";
  const domainInput = qa<HTMLInputElement>(".settings-card input").find((input) => input.value === "acme.co");
  if (domainInput) domainInput.value = domains.map((domain: AnyRecord) => domain.domain).join(", ");
  setText("#preview-agent-name", workspace.botName || "SupportPilot Agent");
  setText(".code-box code", snippet.replace(/\\\//g, "/"));

  q<HTMLButtonElement>("#btn-copy-code")?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    await navigator.clipboard?.writeText(snippet.replace(/\\\//g, "/")).catch(() => null);
    setText("#btn-copy-code", "Copied");
  }, true);

  q<HTMLButtonElement>("#btn-regenerate-key")?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const result = await fetch(`/api/workspaces/${encodeURIComponent(workspace.id)}/widget-key/regenerate`, { method: "POST" }).then((res) => res.json()).catch(() => null);
    if (result?.workspace?.widgetKey && keyInput) keyInput.value = result.workspace.widgetKey;
  }, true);

  q<HTMLButtonElement>("#btn-save-settings")?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const brandColor = colorValue(q<HTMLSelectElement>("#assistant-color-input")?.value, workspace.brandColor || "#fa8f1f");
    await fetch(`/api/workspaces/${encodeURIComponent(workspace.id)}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: workspace.name,
        botName: nameInput?.value || workspace.botName,
        brandColor,
        welcomeMessage: workspace.welcomeMessage,
        escalationEmail: workspace.escalationEmail,
        calendlyUrl: workspace.calendlyUrl || "",
      }),
    }).catch(() => null);
    setText("#btn-save-settings", "Saved");
  }, true);
}

function colorValue(value: string | undefined, fallback: string) {
  if (value === "solid-purple") return "#6d56ff";
  if (value === "solid-success") return "#22c55e";
  if (value === "gradient-orange") return "#fa8f1f";
  return fallback;
}

function hydratePortal(data: AnyRecord) {
  const workspace = data.workspace || {};
  const tickets = data.tickets || [];
  setText(".chat-header-name", workspace.botName || "Pilot");
  setText(".welcome-name", workspace.botName || "Pilot");
  setText(".welcome-body", workspace.welcomeMessage || "Ask me anything about pricing, integrations, billing, or security.");
  renderPortalTickets(tickets);

  const send = async (text: string) => {
    appendPortalChat("user", text);
    showPortalTyping();
    const reply = await askChatApi(text, workspace.id);
    removePortalTyping();
    appendPortalChat("bot", reply.text, reply.citation, reply.confidence);
  };

  (window as any).sendQuickQuestion = (text: string) => {
    void send(text);
  };
  (window as any).handleChatFormSubmit = (event: Event) => {
    event.preventDefault();
    const input = q<HTMLInputElement>("#chat-input-field");
    const text = input?.value.trim();
    if (!text) return;
    if (input) input.value = "";
    void send(text);
  };
  (window as any).sendWidgetMessage = (event: Event) => {
    event.preventDefault();
    const input = q<HTMLInputElement>("#widget-input");
    const text = input?.value.trim();
    if (!text) return;
    if (input) input.value = "";
    void send(text);
  };
  (window as any).submitNewTicket = async (event: Event) => {
    event.preventDefault();
    const subject = q<HTMLInputElement>("#modal-subject-input")?.value.trim() || "Customer support request";
    const category = q<HTMLSelectElement>("#modal-category-input")?.value || "general";
    const description = q<HTMLTextAreaElement>("#modal-desc-input")?.value.trim() || subject;
    const result = await fetch("/api/portal/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id, subject, category, description }),
    }).then((res) => res.json()).catch(() => null);
    if (result?.ticket) {
      tickets.unshift(result.ticket);
      renderPortalTickets(tickets);
      (window as any).closeCreateTicketModal?.();
    }
  };
}

function renderPortalTickets(tickets: AnyRecord[]) {
  setText("#open-tickets-count", `${tickets.length} active ticket${tickets.length === 1 ? "" : "s"}`);
  setHtml("#ticket-container", tickets.slice(0, 5).map((ticket) => `
    <div class="ticket-row" onclick="openTicketDrawer('${escapeHtml(ticketCode(ticket.id))}', '${escapeHtml(ticket.subject)}')">
      <span class="ticket-id">${escapeHtml(ticketCode(ticket.id))}</span>
      <span class="ticket-subject">${escapeHtml(ticket.subject)}</span>
      <span class="ticket-last-update">Last activity: ${formatAge(ticket.updatedAt)}</span>
      <span class="ticket-status status-active">${escapeHtml(ticket.status?.replace(/_/g, " ") || "Open")}</span>
      <span class="ticket-chevron">➔</span>
    </div>
  `).join(""));
}

function appendPortalChat(sender: "user" | "bot", text: string, citation = "", confidence = 0) {
  const body = q("#chat-body-container");
  if (!body) return;
  const isUser = sender === "user";
  body.insertAdjacentHTML("beforeend", `
    <div class="chat-message ${isUser ? "user-msg" : "bot-msg"}">
      ${isUser ? "" : `<div class="chat-avatar-mini">P</div>`}
      <div class="chat-bubble">${escapeHtml(text)}${citation ? `<div class="citation-mini">${escapeHtml(citation)} · ${Math.round(confidence * 100)}%</div>` : ""}</div>
    </div>
  `);
  body.scrollTop = body.scrollHeight;
}

function showPortalTyping() {
  const body = q("#chat-body-container");
  body?.insertAdjacentHTML("beforeend", `<div class="chat-message bot-msg" id="chat-typing-indicator"><div class="chat-avatar-mini">P</div><div class="chat-bubble">Checking approved sources...</div></div>`);
}

function removePortalTyping() {
  q("#chat-typing-indicator")?.remove();
}

async function askChatApi(text: string, workspaceId?: string) {
  const id = crypto.randomUUID();
  const response = await fetch(`/api/chat${workspaceId ? `?workspace=${encodeURIComponent(workspaceId)}` : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ id, role: "user", parts: [{ type: "text", text }] }],
    }),
  }).catch(() => null);
  if (!response) return { text: "I could not reach the support agent. A human can follow up.", citation: "", confidence: 0 };
  const raw = await response.text();
  const deltas = Array.from(raw.matchAll(/"delta":"((?:\\.|[^"])*)"/g), (match) => safeJsonString(match[1]));
  const textFromStream = deltas.join("") || raw.replace(/^data:\s*/gm, "").replace(/\[[A-Z]+\]/g, "").trim();
  const citationMatch = raw.match(/"source":"((?:\\.|[^"])*)"/);
  const scoreMatch = raw.match(/"score":([0-9.]+)/);
  return {
    text: textFromStream || "I do not know from the docs I have. A human can help with that.",
    citation: citationMatch ? safeJsonString(citationMatch[1]) : "",
    confidence: scoreMatch ? Number(scoreMatch[1]) : 0.72,
  };
}

function safeJsonString(value: string) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}
