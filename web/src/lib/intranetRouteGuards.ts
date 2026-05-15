import { isAxiosError } from "axios";
import { isRedirect, redirect } from "@tanstack/react-router";

import { gearhubApiClientOptions } from "../api/clientOptions";
import { getApiAuthMeQueryOptions } from "../api/generated/react-query";
import { gearhubQueryClient } from "./gearhubQueryClient";
import { getAccessToken } from "../store/authSessionStore";

export function requireStaffSession(redirectPath: string): void {
  if (!getAccessToken()) {
    throw redirect({
      to: "/login",
      search: { redirect: redirectPath },
    });
  }
}

/**
 * Loads the current profile via <c>GET /api/Auth/me</c> (cached by React Query).
 * Authoritative permissions come from the API, not from the JWT.
 */
export async function requireStaffPermission(
  redirectPath: string,
  permission: string,
): Promise<void> {
  requireStaffSession(redirectPath);
  try {
    const profile = await gearhubQueryClient.ensureQueryData({
      ...getApiAuthMeQueryOptions(gearhubApiClientOptions),
    });
    const perms = new Set(profile.permissions ?? []);
    if (!perms.has(permission)) {
      throw redirect({
        to: "/intranet",
        search: { forbidden: permission },
      });
    }
  } catch (err) {
    if (isRedirect(err)) {
      throw err;
    }
    if (isAxiosError(err) && err.response?.status === 401) {
      throw redirect({
        to: "/login",
        search: { redirect: redirectPath },
      });
    }
    throw err;
  }
}
