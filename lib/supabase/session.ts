import { demoUsers } from "@/lib/enterprise/demo-data";
import type { EnterpriseUser, UserRole } from "@/lib/enterprise/types";

export function getDemoUser(role: UserRole = "admin"): EnterpriseUser {
  return demoUsers.find((user) => user.role === role) ?? demoUsers[demoUsers.length - 1];
}
