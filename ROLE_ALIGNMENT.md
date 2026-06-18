# Role Alignment

SupportPilot now demonstrates an enterprise AI support workspace across product, engineering, architecture, implementation, and frontend roles.

| Role | Relevant evidence |
| --- | --- |
| AI Product Designer | Human approval workflow, manager queue, confidence/rationale/citation side panel, customer portal, analytics views, and escalation states. |
| AI Product Engineer | Next.js App Router implementation, typed enterprise domain model, Supabase services, AI draft endpoint, decision endpoint, and deterministic demo fallback. |
| AI Solutions Architect | Supabase schema, pgvector retrieval RPC, RLS policies, provider abstraction for Google/OpenAI/Anthropic, and audit-first workflow design. |
| AI Implementation Consultant | `CLIENT_SETUP.md`, `INGEST.md`, seed data, env documentation, Lite-to-Enterprise path, and demo-safe local operation without live credentials. |
| GenAI Frontend Engineer | Ticket inbox filters, ticket detail AI side panel, approval queue, knowledge uploader, analytics dashboard, and preserved embeddable chat widget. |

The portfolio story is intentionally end-to-end: a client can begin with the white-label Lite widget, then move to the enterprise workspace by provisioning Supabase, seeding the schema, uploading approved sources, and enabling provider keys.
