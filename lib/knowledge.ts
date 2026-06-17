export type KnowledgeFile = {
  filename: string;
  content: string;
};

export const DEFAULT_KNOWLEDGE_FILES: KnowledgeFile[] = [
  {
    filename: "pricing.md",
    content: `# Pricing Plans

## Free
The Free plan costs $0 forever and supports up to 5 members per workspace.

## Pro
The Pro plan costs $12 per user per month. Annual billing saves 20%, bringing the effective price to $9.60 per user per month. Pro includes unlimited members, cycles, roadmaps, advanced filtering, and priority support with a 24-hour response SLA.

## Business
The Business plan costs $24 per user per month. Annual billing saves 20%, bringing the effective price to $19.20 per user per month. Business adds SAML SSO, custom roles, audit logs, advanced analytics, a 4-hour support SLA, and a dedicated customer success manager for larger teams.

## Enterprise
Enterprise is custom priced and includes US or EU data residency, 365-day audit logs, 1-hour priority support, custom onboarding, and a named account manager.`,
  },
  {
    filename: "features.md",
    content: `# Product Features

## Issues
Issues are the core unit of work. Each issue has a rich-text description, priority, status, assignee, label, due date, and estimate.

## Projects
Projects group related issues around a goal or deliverable and can be viewed as a list, board, or timeline.

## Cycles
Cycles are one- or two-week iterations with analytics for completion rate, velocity, and scope creep.

## Roadmaps
Roadmaps show projects and milestones on a leadership-friendly timeline and are available on Pro and above.`,
  },
  {
    filename: "integrations.md",
    content: `# Integrations

## GitHub
The GitHub integration links pull requests to issues, moves issues to In Review when a pull request opens, and closes issues when a pull request is merged.

## Slack
The Slack integration lets teams create, update, and receive notifications about issues from Slack.

## Notion
The Notion integration creates a two-way sync between issues and Notion database items. It is available on Pro and Business plans.`,
  },
  {
    filename: "security.md",
    content: `# Security and Privacy

## SOC 2
AcmeDesk is SOC 2 Type II certified. The latest audit report is available to Business and Enterprise customers under NDA.

## Encryption
All customer data is encrypted at rest with AES-256 and in transit with TLS 1.2 or higher.

## Single Sign-On
SAML 2.0 SSO is available on Business and Enterprise plans.`,
  },
  {
    filename: "billing.md",
    content: `# Billing and Account Management

## Refund policy
First-time upgrades from Free to a paid plan are eligible for a full refund within 14 days of the initial charge.

## Cancellation
Customers can cancel from Settings > Billing > Cancel Plan. Cancellation takes effect at the end of the current billing period, and existing data is retained.`,
  },
];
