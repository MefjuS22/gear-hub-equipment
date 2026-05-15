import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { gearhubApiClientOptions } from "../api/clientOptions";
import {
  getApiAuthMeQueryKey,
  useGetApiAuthMe,
} from "../api/generated/react-query";
import type { AuthResponseDto, UserProfileDto } from "../api/generated/types";
import { useAuthSessionStore } from "../store/authSessionStore";

type AuthContextValue = {
  token: string | null;
  user: UserProfileDto | undefined;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  setSession: (auth: AuthResponseDto) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const accessToken = useAuthSessionStore((s) => s.accessToken);
  const clearSession = useAuthSessionStore((s) => s.clearSession);
  const setSessionFromApi = useAuthSessionStore((s) => s.setSessionFromApi);

  const meQuery = useGetApiAuthMe({
    client: gearhubApiClientOptions,
    query: {
      enabled: Boolean(accessToken),
      retry: false,
    },
  });

  useEffect(() => {
    if (!accessToken || !meQuery.isError || !meQuery.error) {
      return;
    }
    if (isAxiosError(meQuery.error) && meQuery.error.response?.status === 401) {
      clearSession();
      queryClient.removeQueries({ queryKey: getApiAuthMeQueryKey() });
    }
  }, [accessToken, meQuery.isError, meQuery.error, queryClient, clearSession]);

  const setSession = useCallback(
    (auth: AuthResponseDto) => {
      const ok = setSessionFromApi({
        accessToken: auth.accessToken,
        expiresAtUtc: auth.expiresAtUtc,
      });
      if (ok) {
        void queryClient.invalidateQueries();
      }
    },
    [queryClient, setSessionFromApi],
  );

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
  }, [queryClient, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: accessToken,
      user: meQuery.data,
      isAuthenticated: Boolean(accessToken),
      isLoadingProfile: Boolean(accessToken) && meQuery.isPending,
      setSession,
      logout,
    }),
    [accessToken, meQuery.data, meQuery.isPending, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
