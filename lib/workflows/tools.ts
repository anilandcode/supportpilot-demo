import type { ToolDefinition } from "@/lib/enterprise/types";

export const READ_ONLY_TOOL_REGISTRY: Array<Pick<ToolDefinition, "name" | "description" | "readOnly" | "active">> = [
  {
    name: "search_knowledge",
    description: "Search approved workspace knowledge chunks for cited support evidence.",
    readOnly: true,
    active: true,
  },
  {
    name: "get_ticket_history",
    description: "Read customer metadata and ticket conversation history for agent-assist drafts.",
    readOnly: true,
    active: true,
  },
  {
    name: "get_workspace_policy",
    description: "Read approval, escalation, and safety policies before deciding whether to answer.",
    readOnly: true,
    active: true,
  },
];
