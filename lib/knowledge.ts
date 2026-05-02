export const KNOWLEDGE = `
# Linear-clone Help Center

## Pricing Plans

Linear-clone offers four plans designed to fit teams of every size, from solo founders to large enterprises.

**Free Plan**
The Free plan is available at no cost, forever. It supports up to 5 members per workspace and includes unlimited issues, projects, and basic integrations (GitHub and Slack). Storage is capped at 250 MB per workspace. The Free plan does not include Cycles, Roadmaps, or advanced analytics. It is ideal for small teams or individuals who want to try Linear-clone before committing.

**Pro Plan — $12 per user per month**
The Pro plan unlocks the full Linear-clone feature set for growing teams. It includes unlimited members, unlimited file uploads (up to 10 GB per workspace), Cycles (sprints), Roadmaps, advanced filtering, and priority support with a 24-hour response SLA. Pro is billed monthly or annually. Annual billing saves 20% — bringing the effective cost to $9.60 per user per month. Pro is the most popular plan for product and engineering teams of 5–50 people.

**Business Plan — $24 per user per month**
The Business plan adds enterprise-grade controls on top of everything in Pro. Key additions include: SAML-based Single Sign-On (SSO), Role-Based Access Control (RBAC) with custom roles, audit logs (90-day retention), advanced analytics dashboards, SLA-backed support with a 4-hour response time, and a dedicated customer success manager for teams over 20 seats. Annual billing brings the effective rate to $19.20 per user per month (20% discount). Business is designed for teams that need compliance controls or are approaching SOC 2 audits.

**Enterprise Plan — Custom pricing**
The Enterprise plan is tailored for organizations with 100+ users or strict security and compliance requirements. Pricing is negotiated directly with the Linear-clone sales team and is based on seat count, required features, and contract length. Enterprise adds: custom data residency (US or EU), 365-day audit logs, priority 1-hour SLA support, custom onboarding and training, and a named account manager. To get a quote, contact the sales team via the "Talk to Sales" button on the pricing page or book a call at calendly.com/linear-clone/enterprise.

---

## Features

**Issues**
Issues are the core unit of work in Linear-clone. Every issue has a title, description (rich text with Markdown support), priority level (urgent, high, medium, low, no priority), status, assignee, label, due date, and estimate. Issues can be linked to projects, cycles, and roadmaps. You can create issues from any screen using the keyboard shortcut "C", from Slack via the /linear command, or by converting a GitHub comment directly. Issues support threaded comments, emoji reactions, and file attachments up to 50 MB each.

**Projects**
Projects group related issues around a goal or deliverable. Each project has a lead, a target date, a progress indicator (automatically calculated from linked issues), and a status (planned, in progress, paused, completed, cancelled). Projects can contain sub-projects. You can view projects as a list, board, or timeline (Gantt-style). Project updates — short status posts — can be written by the lead to keep stakeholders informed without requiring a meeting.

**Cycles (Sprints)**
Cycles are time-boxed iterations, typically one or two weeks, that help teams focus on a defined batch of work. A cycle has a start date, end date, and a target list of issues. At the end of a cycle, incomplete issues are automatically rolled over to the next cycle or moved to the backlog — your choice. Cycle analytics show completion rate, velocity, and scope creep. Cycles are available on Pro and above.

**Roadmaps**
Roadmaps provide a high-level, visual timeline of projects and milestones. They are designed for leadership and cross-functional stakeholders who need to see the big picture without diving into individual issues. Roadmaps are date-driven and auto-update as project target dates change. You can share a read-only roadmap link with external stakeholders — no account required to view. Roadmaps are available on Pro and above.

**Views and Filters**
Linear-clone supports powerful filtering across any combination of: assignee, label, priority, status, project, cycle, team, creator, and custom fields. Saved views remember your filter configurations. My Issues, Active, Backlog, and All Issues are pre-built views. Teams can create shared views that all members can access.

**Notifications and Inbox**
The Inbox collects all activity relevant to you: issue assignments, mentions, comments, and status changes. You can set notification preferences globally or per-team. Email notifications can be batched (immediate, hourly, or daily digest). Mobile push notifications are available via the iOS and Android apps.

---

## Integrations

**GitHub**
The GitHub integration is the most-used integration in Linear-clone. It lets you link pull requests to issues, automatically move issues to "In Review" when a PR is opened, and close issues when a PR is merged. You can also create issues directly from GitHub comments using the Linear-clone bot. The integration requires installing the Linear-clone GitHub App on your organization or repository. Multiple GitHub organizations can be connected to a single Linear-clone workspace.

**Slack**
The Slack integration lets your team create, update, and receive notifications about Linear-clone issues without leaving Slack. Key features: use "/linear" to create an issue from any channel, receive notifications in a dedicated channel when issues are created or updated, unfurl Linear-clone links in Slack messages, and set up custom notification rules per team or project. The Slack integration requires a Slack workspace admin to authorize the app.

**Figma**
The Figma integration lets you embed Figma frames, prototypes, and file previews directly inside Linear-clone issue descriptions and comments. When you paste a Figma URL, it renders as an inline preview. Clicking the preview opens it full-screen within Linear-clone. This integration does not require any installation — it activates automatically when a Figma URL is detected. Note: the Figma file must be set to "Anyone with the link can view" for the preview to render.

**Notion**
The Notion integration creates a two-way sync between Linear-clone issues and Notion database items. You can push a Linear-clone issue to a Notion database, and status updates in either tool will sync back to the other. The integration is configured per workspace and requires a Notion connection authorized by a Notion workspace admin. Notion integration is available on Pro and Business plans.

**Other integrations**
Linear-clone also integrates with: Sentry (attach error events to issues), Zendesk (link support tickets to engineering issues), Intercom (create issues from customer conversations), PagerDuty (create incidents from issues), and Zapier (connect to 5,000+ apps). The REST API and webhooks allow custom integrations for any tool not listed here.

---

## Security

**SOC 2 Type II**
Linear-clone is SOC 2 Type II certified. The audit covers the Security, Availability, and Confidentiality trust service criteria. The latest audit report is available to Business and Enterprise customers under NDA. To request a copy, open a support ticket with the subject "SOC 2 Report Request."

**Encryption**
All data is encrypted at rest using AES-256 and in transit using TLS 1.2 or higher. Database backups are also encrypted. Linear-clone does not store plaintext passwords — passwords are hashed using bcrypt with a minimum cost factor of 12. Encryption keys are managed via AWS KMS with automatic rotation enabled.

**Single Sign-On (SSO)**
SAML 2.0-based SSO is available on the Business and Enterprise plans. Linear-clone supports integration with all major identity providers including Okta, Azure Active Directory, Google Workspace, and OneLogin. When SSO is enabled, workspace members are required to authenticate through your IdP. Admins can enforce SSO for all members or allow a grace period for migration.

**Role-Based Access Control (RBAC)**
Business and Enterprise workspaces support custom roles beyond the default Member and Admin roles. Admins can create roles with granular permissions across: issue creation, issue deletion, project management, member management, billing access, API key creation, and integration management. Roles are assigned per member and apply workspace-wide. Team-level role overrides are planned for a future release.

**Data Privacy and GDPR**
Linear-clone is GDPR compliant. Data is stored in the United States by default. Enterprise customers can opt for EU data residency (Frankfurt, Germany). Linear-clone acts as a Data Processor for customer data and provides a Data Processing Agreement (DPA) on request. Personal data can be exported or deleted via workspace settings under Account > Privacy. Data deletion requests are completed within 30 days.

---

## Billing and Refunds

**Payment methods**
Linear-clone accepts all major credit and debit cards (Visa, Mastercard, American Express, Discover) as well as ACH bank transfers for annual Business and Enterprise contracts. Invoices are issued monthly for monthly plans and annually for annual plans. All prices are in USD.

**Annual discount**
Choosing annual billing saves 20% compared to month-to-month pricing. The annual discount applies to both Pro ($9.60/user/month effective) and Business ($19.20/user/month effective). Annual plans are billed upfront for the full 12-month term. If you switch from monthly to annual mid-cycle, you are charged the annual amount minus a credit for the remaining days on your current monthly billing period.

**Prorated upgrades and downgrades**
When you upgrade your plan mid-billing cycle, Linear-clone prorates the charge: you pay only for the remaining days in the cycle at the new plan's rate. When you add new seats mid-cycle, the same proration logic applies. Downgrading a plan takes effect at the end of the current billing cycle — you retain access to the higher-tier features until then, and no partial refund is issued for the difference.

**14-day refund policy**
New subscriptions (first-time upgrades from Free to any paid plan) are eligible for a full refund within 14 days of the initial charge, no questions asked. Renewals, seat additions, and plan upgrades after the initial subscription are not eligible for refunds. To request a refund, email billing@linear-clone.com with your workspace name and the charge date, or open a billing support ticket from workspace settings.

**Cancellation**
You can cancel your subscription at any time from Settings > Billing > Cancel Plan. Cancellation takes effect at the end of the current billing period. After cancellation, your workspace is downgraded to the Free plan. All data, issues, and project history are retained on the Free plan — nothing is deleted. You can re-subscribe at any time.

---

## Account Management

**Creating a workspace**
A workspace is the top-level container for your organization in Linear-clone. To create one, sign up at app.linear-clone.com and follow the onboarding flow. You can have multiple workspaces (for example, one for your product team and one for a client project) — each workspace is billed separately. Your user account can be a member of up to 10 workspaces on the Free plan and unlimited workspaces on paid plans.

**Inviting members**
To invite team members, go to Settings > Members > Invite People. You can invite by email address or generate an invite link. Invite links can be set to expire after 24 hours, 7 days, or never. New members join as the default Member role unless you specify a different role at the time of invite. Bulk invites (CSV upload) are available on Business and Enterprise plans.

**Member roles**
There are three default roles: **Admin** (full workspace control, including billing), **Member** (can create and edit issues, projects, and cycles), and **Guest** (read-only access; Guests do not count toward your seat limit). Custom roles are available on Business and Enterprise. Only one Admin is required per workspace, but you can have multiple Admins.

**Removing members**
Admins can remove members from Settings > Members. Removing a member revokes their access immediately. Their created issues, comments, and project history are retained and remain attributed to their name. You can reassign their open issues in bulk from the removal confirmation screen.

---

## Common Troubleshooting

**Login issues**
If you cannot log in, first check that you're using the correct email address. If your workspace uses SSO, you must log in via your company's identity provider — the standard email/password form will not work. For forgotten passwords, use the "Forgot password?" link on the login page; password reset emails arrive within 2 minutes. If you don't receive the email, check your spam folder and ensure your email provider isn't blocking mail from no-reply@linear-clone.com. If SSO is broken for your whole team, an Admin can temporarily disable SSO from the identity provider dashboard — contact your IT admin.

**Sync problems**
If issues or comments are not updating in real time, check your internet connection first. Linear-clone uses WebSockets for live updates — some corporate firewalls block WebSocket connections. Try refreshing the page; most sync issues resolve on reload. If the GitHub integration stops syncing, check that the Linear-clone GitHub App is still installed on your organization (GitHub org admins can accidentally remove it). Re-installing the app re-establishes the webhook connection without losing existing issue links.

**API errors**
The Linear-clone REST API and GraphQL API both use API keys for authentication. Keys are created per user from Settings > API > Create Key. Common errors: 401 Unauthorized means the key is missing or expired — generate a new key. 403 Forbidden means the key's owner doesn't have permission for that action — check the member's role. 429 Too Many Requests means you've hit the rate limit (1,000 requests per minute per key) — implement exponential backoff in your integration. Full API documentation is at developers.linear-clone.com.

**Notification problems**
If you're not receiving email notifications, check Settings > Notifications and confirm that email notifications are enabled for the relevant event types. Also check that your email provider is not filtering messages from notifications@linear-clone.com. In-app notifications appear in the Inbox (bell icon, top right). If the Inbox count is stuck, a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) clears cached counts.
`;
