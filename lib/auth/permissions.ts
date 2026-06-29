import type { MembershipRole } from "@/lib/enterprise/types";

export type AuthPersona = "anonymous" | "customer" | MembershipRole;

const ROLE_RANK: Record<MembershipRole, number> = {
  viewer: 10,
  analyst: 20,
  agent: 30,
  manager: 40,
  admin: 50,
  owner: 60,
};

export const ADMIN_ROLES: MembershipRole[] = ["owner", "admin", "manager", "agent", "analyst", "viewer"];
export const STAFF_ROLES: MembershipRole[] = ["owner", "admin", "manager", "agent"];
export const APPROVAL_ROLES: MembershipRole[] = ["owner", "admin", "manager"];
export const OWNER_ROLES: MembershipRole[] = ["owner"];

export type RouteAccessDecision = {
  allowed: boolean;
  redirectTo?: string;
  reason: "allowed" | "unauthenticated" | "wrong_role";
};

export function canPerformMembershipAction(role: MembershipRole, minimumRole: MembershipRole) {
  return ROLE_RANK[role] >= ROLE_RANK[minimumRole];
}

export function canAccessAnyRole(role: MembershipRole, allowedRoles: MembershipRole[]) {
  return allowedRoles.includes(role);
}

export function getRequiredAdminRoles(pathname: string): MembershipRole[] {
  if (pathname.startsWith("/admin/settings/billing") || pathname.startsWith("/admin/billing")) return OWNER_ROLES;
  if (pathname.startsWith("/admin/settings/security")) return ["owner", "admin"];
  if (pathname.startsWith("/admin/approvals")) return APPROVAL_ROLES;
  if (pathname.startsWith("/admin/settings")) return ["owner", "admin"];
  return STAFF_ROLES;
}

export function decideAdminRouteAccess(input: { authenticated: boolean; role: MembershipRole | null; pathname: string }): RouteAccessDecision {
  if (!input.authenticated) {
    return { allowed: false, redirectTo: `/login?next=${encodeURIComponent(input.pathname)}`, reason: "unauthenticated" };
  }

  if (!input.role) {
    return { allowed: false, redirectTo: "/portal", reason: "wrong_role" };
  }

  const requiredRoles = getRequiredAdminRoles(input.pathname);
  if (!canAccessAnyRole(input.role, requiredRoles)) {
    const fallback = input.role === "manager" ? "/admin/approvals" : "/admin/tickets";
    return { allowed: false, redirectTo: fallback, reason: "wrong_role" };
  }

  return { allowed: true, reason: "allowed" };
}

export function profileRoleToMembershipRole(role: "customer" | "support_agent" | "support_manager" | "admin"): MembershipRole {
  if (role === "admin") return "owner";
  if (role === "support_manager") return "manager";
  if (role === "support_agent") return "agent";
  return "viewer";
}

export function canInviteRole(actorRole: MembershipRole, invitedRole: MembershipRole) {
  if (actorRole === "owner") return true;
  if (actorRole === "admin") return invitedRole !== "owner";
  return false;
}

export function canApproveDraft(role: MembershipRole | null, requiredRole: MembershipRole | null) {
  if (!role) return false;
  return canPerformMembershipAction(role, requiredRole ?? "manager");
}

export function canAccessPortal(input: { authenticated: boolean; isCustomer: boolean; isInternalPreview: boolean }) {
  if (input.isInternalPreview) return true;
  return input.authenticated && input.isCustomer;
}
