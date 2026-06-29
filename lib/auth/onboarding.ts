import type { LaunchChecklistStep } from "@/lib/enterprise/types";

export const ONBOARDING_CHECKLIST: Array<{ step: LaunchChecklistStep; label: string; description: string }> = [
  {
    step: "knowledge_source",
    label: "Add knowledge source",
    description: "Upload or paste the first approved FAQ, policy, or support article.",
  },
  {
    step: "embeddings_generated",
    label: "Generate source chunks",
    description: "Confirm approved sources have searchable chunks and embedding metadata.",
  },
  {
    step: "golden_questions",
    label: "Pass golden questions",
    description: "Validate citations and safe refusal behavior before launch.",
  },
  {
    step: "brand_disclosure",
    label: "Configure brand and disclosure",
    description: "Set the assistant name, colors, welcome copy, and AI disclosure.",
  },
  {
    step: "escalation_owner",
    label: "Set escalation owner",
    description: "Add the manager or inbox that receives risky conversations.",
  },
  {
    step: "domain_verified",
    label: "Verify widget domain",
    description: "Restrict the widget to approved customer origins.",
  },
  {
    step: "widget_installed",
    label: "Install widget",
    description: "Place the script or iframe on the customer site.",
  },
  {
    step: "monitoring_enabled",
    label: "Enable monitoring",
    description: "Turn on app error and product-event monitoring for launch visibility.",
  },
];

export function slugifyWorkspaceName(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "workspace";
}

export function makeUniqueSlug(value: string) {
  return `${slugifyWorkspaceName(value)}-${Date.now().toString(36)}`;
}

export function makeWidgetKey() {
  return `wk_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}
