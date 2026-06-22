import { createHash } from "node:crypto";

type RedactionResult = {
  text: string;
  findings: string[];
  hash: string;
};

const REDACTION_PATTERNS: Array<{ label: string; pattern: RegExp; replacement: string }> = [
  { label: "email", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: "[redacted-email]" },
  { label: "payment_card", pattern: /\b(?:\d[ -]*?){13,19}\b/g, replacement: "[redacted-card]" },
  { label: "phone", pattern: /\b(?:\+?\d[\s().-]?){8,}\d\b/g, replacement: "[redacted-phone]" },
  { label: "ssn", pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[redacted-ssn]" },
  {
    label: "address",
    pattern: /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/gi,
    replacement: "[redacted-address]",
  },
  { label: "secret", pattern: /\b(password|passcode|secret|api[_\s-]?key|token|cvv)\b[^\n]{0,80}/gi, replacement: "[redacted-secret]" },
];

export function hashSensitiveValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function redactSensitiveText(value: string): RedactionResult {
  const findings = new Set<string>();
  let text = value;

  for (const rule of REDACTION_PATTERNS) {
    text = text.replace(rule.pattern, () => {
      findings.add(rule.label);
      return rule.replacement;
    });
  }

  return {
    text,
    findings: Array.from(findings),
    hash: hashSensitiveValue(value),
  };
}

export function previewRedactedText(value: string, maxLength = 360) {
  const redacted = redactSensitiveText(value);
  const compact = redacted.text.replace(/\s+/g, " ").trim();
  return {
    ...redacted,
    text: compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}...` : compact,
  };
}

export function hasSensitiveFindings(value: string) {
  return redactSensitiveText(value).findings.length > 0;
}
