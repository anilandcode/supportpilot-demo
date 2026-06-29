import { createHash, randomBytes } from "crypto";

export function createInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function inviteUrlFromRequest(request: Request, token: string) {
  return `${new URL(request.url).origin}/invite/accept?token=${encodeURIComponent(token)}`;
}
