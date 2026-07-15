type EscalationEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type TransactionalEmailInput = EscalationEmailInput & {
  from?: string;
};

type TransactionalEmailResult = {
  skipped: boolean;
  id?: string;
  reason?: string;
  ok?: boolean;
  status?: number;
  error?: string;
};

type InvitationEmailInput = {
  to: string;
  role: string;
  workspaceName: string;
  inviteUrl: string;
};

export function isTransactionalEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getTransactionalEmailConfigError() {
  return isTransactionalEmailConfigured() ? null : "RESEND_API_KEY is required to send invitation email in production mode";
}

async function sendTransactionalEmail(input: TransactionalEmailInput): Promise<TransactionalEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = input.from || process.env.ESCALATION_FROM_EMAIL || "SupportPilot <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      skipped: true,
      id: "demo-email",
      reason: "RESEND_API_KEY not configured",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  const data = await response.json().catch(() => null);

  return {
    skipped: false,
    ok: response.ok,
    status: response.status,
    id: data?.id as string | undefined,
    error: data?.message as string | undefined,
  };
}

export async function sendEscalationEmail(input: EscalationEmailInput) {
  return sendTransactionalEmail(input);
}

export async function sendInvitationEmail(input: InvitationEmailInput) {
  const from = process.env.INVITATION_FROM_EMAIL || process.env.ESCALATION_FROM_EMAIL || "SupportPilot <onboarding@resend.dev>";
  const subject = `You're invited to ${input.workspaceName} on SupportPilot`;
  const text = [
    `You've been invited as ${input.role} for ${input.workspaceName}.`,
    "Accept your invitation:",
    input.inviteUrl,
    "This link expires in 7 days.",
  ].join("\n\n");
  const html = [
    `<p>You've been invited as <strong>${escapeHtml(input.role)}</strong> for <strong>${escapeHtml(input.workspaceName)}</strong>.</p>`,
    `<p><a href="${escapeHtml(input.inviteUrl)}">Accept your invitation</a></p>`,
    "<p>This link expires in 7 days.</p>",
  ].join("");

  return sendTransactionalEmail({
    from,
    to: input.to,
    subject,
    text,
    html,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}
