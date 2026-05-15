import { useMemo } from "react";

import { useAuth } from "../providers/AuthProvider";

export function usePermissionSet(): Set<string> {
  const { user } = useAuth();

  return useMemo(() => new Set(user?.permissions ?? []), [user?.permissions]);
}

export function useHasPermission(permission: string): boolean {
  return usePermissionSet().has(permission);
}
