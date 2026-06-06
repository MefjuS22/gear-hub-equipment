import { useQuery } from "@tanstack/react-query";

import { gearhubApiClientOptions } from "../../api/clientOptions";
import type { DashboardStats } from "../../lib/dashboardTypes";
import { getAccessToken } from "../../store/authSessionStore";

async function fetchDashboardStats(): Promise<DashboardStats> {
  const token = getAccessToken();
  const baseUrl = gearhubApiClientOptions.baseURL ?? "";
  const response = await fetch(`${baseUrl}/api/Dashboard/stats`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to load dashboard stats (${response.status})`);
  }

  return response.json() as Promise<DashboardStats>;
}

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    enabled,
  });
}
