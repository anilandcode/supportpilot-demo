export type RlsActor = "anonymous" | "customer" | "agent" | "manager" | "admin" | "owner" | "disabled";
export type RlsOperation = "select" | "insert" | "update" | "delete";

export type RlsExpectation = {
  id: string;
  actor: RlsActor;
  table: string;
  operation: RlsOperation;
  expected: "allow" | "deny";
  policyEvidence: string[];
};

export const REQUIRED_RLS_TABLES = [
  "users",
  "organizations",
  "workspaces",
  "memberships",
  "invitations",
  "portal_identities",
  "workspace_domains",
  "widget_configs",
  "usage_events",
  "approval_policies",
  "customers",
  "tickets",
  "ticket_messages",
  "knowledge_docs",
  "document_chunks",
  "knowledge_embedding_jobs",
  "knowledge_ingestion_jobs",
  "integration_accounts",
  "webhook_endpoints",
  "integration_external_mappings",
  "outbound_events",
  "integration_deliveries",
  "data_deletion_requests",
  "retention_jobs",
  "audit_evidence_exports",
  "ai_runs",
  "ai_feedback",
  "audit_logs",
  "escalation_rules",
  "workspace_checklist_items",
  "golden_questions",
  "missing_knowledge_tasks",
  "model_route_logs",
  "security_events",
  "widget_sessions",
  "retention_settings",
  "tool_definitions",
  "tool_calls",
  "agent_runs",
  "policy_evaluations",
  "grounding_checks",
  "workspace_onboarding_sessions",
] as const;

export const REQUIRED_RLS_HELPERS = [
  "current_user_role",
  "current_user_email",
  "can_access_workspace",
  "can_manage_workspace",
  "has_workspace_role",
  "is_org_owner",
  "is_customer_for_workspace",
] as const;

export const RLS_EXPECTATIONS: RlsExpectation[] = [
  {
    id: "anonymous_denied_tenant_tables",
    actor: "anonymous",
    table: "tickets",
    operation: "select",
    expected: "deny",
    policyEvidence: ["auth.uid()", "can_access_workspace", "is_customer_for_workspace"],
  },
  {
    id: "customer_reads_own_ticket",
    actor: "customer",
    table: "tickets",
    operation: "select",
    expected: "allow",
    policyEvidence: ["customers read own tickets", "is_customer_for_workspace", "current_user_email"],
  },
  {
    id: "customer_creates_own_message_only",
    actor: "customer",
    table: "ticket_messages",
    operation: "insert",
    expected: "allow",
    policyEvidence: ["customers create own messages", "sender = 'customer'", "current_user_email"],
  },
  {
    id: "agent_reads_workspace_tickets",
    actor: "agent",
    table: "tickets",
    operation: "select",
    expected: "allow",
    policyEvidence: ["workspace staff manage tickets", "can_access_workspace"],
  },
  {
    id: "agent_cannot_manage_approval_policy",
    actor: "agent",
    table: "approval_policies",
    operation: "update",
    expected: "deny",
    policyEvidence: ["managers manage approval policies", "can_manage_workspace"],
  },
  {
    id: "manager_can_decide_approval",
    actor: "manager",
    table: "ai_runs",
    operation: "update",
    expected: "allow",
    policyEvidence: ["workspace staff manage ai runs", "can_access_workspace"],
  },
  {
    id: "admin_can_manage_sources",
    actor: "admin",
    table: "knowledge_docs",
    operation: "insert",
    expected: "allow",
    policyEvidence: ["workspace staff manage docs", "can_access_workspace"],
  },
  {
    id: "owner_manages_invitations",
    actor: "owner",
    table: "invitations",
    operation: "insert",
    expected: "allow",
    policyEvidence: ["managers manage invitations", "has_workspace_role", "owner", "admin"],
  },
  {
    id: "disabled_membership_denied",
    actor: "disabled",
    table: "memberships",
    operation: "select",
    expected: "deny",
    policyEvidence: ["status = 'active'", "can_access_workspace"],
  },
];

export function describeRlsMatrix() {
  return RLS_EXPECTATIONS.map((expectation) => `${expectation.actor}:${expectation.operation}:${expectation.table}:${expectation.expected}`);
}
