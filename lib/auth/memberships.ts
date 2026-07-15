import type { MembershipRole } from "../enterprise/types.ts";
import { canInviteRole } from "./permissions.ts";

export type MembershipMutationDecision = {
  allowed: boolean;
  reason?: "cannot_manage_role" | "last_owner";
};

export function canManageMembershipMutation(input: {
  actorRole: MembershipRole;
  targetRole: MembershipRole;
  nextRole?: MembershipRole | null;
  nextStatus?: "active" | "disabled" | null;
  activeOwnerCount: number;
}): MembershipMutationDecision {
  if (!canInviteRole(input.actorRole, input.nextRole ?? input.targetRole)) {
    return { allowed: false, reason: "cannot_manage_role" };
  }

  if (input.actorRole !== "owner" && input.targetRole === "owner") {
    return { allowed: false, reason: "cannot_manage_role" };
  }

  const roleWouldStopBeingOwner = input.nextRole !== undefined && input.nextRole !== null && input.nextRole !== "owner";
  const statusWouldDisableOwner = input.nextStatus === "disabled";
  const removesOwner = input.targetRole === "owner" && (roleWouldStopBeingOwner || statusWouldDisableOwner);

  if (removesOwner && input.activeOwnerCount <= 1) {
    return { allowed: false, reason: "last_owner" };
  }

  return { allowed: true };
}
