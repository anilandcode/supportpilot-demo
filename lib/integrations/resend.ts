type EscalationEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEscalationEmail(input: EscalationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ESCALATION_FROM_EMAIL || "SupportPilot <onboarding@resend.dev>";

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
