import type { RentalOrderListDto, UserProfileDto } from "../api/generated/types";
import { AppRoles } from "./appRoles";

/** Matches backend <c>OrderService.GetByIdForViewerAsync</c>: Admin in DB or placing user. */
export function canViewIntranetOrderDetail(
  viewer: UserProfileDto | undefined,
  order: Pick<RentalOrderListDto, "userId">,
): boolean {
  if (!viewer?.id) {
    return false;
  }
  const roles = new Set(viewer.roles ?? []);
  if (roles.has(AppRoles.Admin)) {
    return true;
  }
  return order.userId === viewer.id;
}
