import type { UserProfileDto } from "../api/generated/types";
import { AppRoles } from "./appRoles";

export function userHasAdminRole(user: UserProfileDto | undefined): boolean {
  const roles = user?.roles ?? [];
  return roles.includes(AppRoles.Admin);
}
