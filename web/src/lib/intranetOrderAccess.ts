import type { RentalOrderListDto, UserProfileDto } from "../api/generated/types";
import { userHasAdminRole } from "./userRoles";

/** Matches backend <c>OrderService.GetByIdForViewerAsync</c>: Admin in DB or placing user. */
export function canViewIntranetOrderDetail(
  viewer: UserProfileDto | undefined,
  order: Pick<RentalOrderListDto, "userId">,
): boolean {
  if (!viewer?.id) {
    return false;
  }
  if (userHasAdminRole(viewer)) {
    return true;
  }
  return order.userId === viewer.id;
}
