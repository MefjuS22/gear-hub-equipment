import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";

export const AUTH_SESSION_STORAGE_KEY = "gearhub-auth-session";

/**
 * Persisted auth slice (matches `partialize`). Validated on rehydrate and when reading raw storage.
 */
export const authSessionPersistedSchema = z.object({
  accessToken: z.string().min(1).nullable(),
  expiresAtUtc: z.string().nullable().optional(),
});

export type AuthSessionPersisted = z.infer<typeof authSessionPersistedSchema>;

const persistEnvelopeSchema = z.object({
  state: authSessionPersistedSchema,
  version: z.number().optional(),
});

/** Parse the JSON zustand-persist writes to `localStorage`. */
export function parsePersistedAuthEnvelope(raw: string): AuthSessionPersisted | null {
  try {
    const data: unknown = JSON.parse(raw);
    const parsed = persistEnvelopeSchema.safeParse(data);
    if (!parsed.success) {
      return null;
    }
    return parsed.data.state;
  } catch {
    return null;
  }
}

/** Synchronous read for router guards / axios before Zustand has rehydrated from disk. */
export function readPersistedAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  const state = parsePersistedAuthEnvelope(raw);
  if (!state) {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
  return state.accessToken;
}

/** Validates `/api/Auth/login` (and register) response fields before persisting. */
export const authSessionFromApiSchema = z.object({
  accessToken: z.string().min(1),
  expiresAtUtc: z.string().nullable().optional(),
});

type AuthSessionState = AuthSessionPersisted & {
  /**
   * Validates with {@link authSessionFromApiSchema} then updates persisted session.
   * @returns whether the session was updated
   */
  setSessionFromApi: (input: unknown) => boolean;
  clearSession: () => void;
};

const emptySession: AuthSessionPersisted = {
  accessToken: null,
  expiresAtUtc: null,
};

export const useAuthSessionStore = create<AuthSessionState>()(
  persist(
    (set) => ({
      ...emptySession,
      setSessionFromApi: (input) => {
        const parsed = authSessionFromApiSchema.safeParse(input);
        if (!parsed.success) {
          return false;
        }
        set({
          accessToken: parsed.data.accessToken,
          expiresAtUtc: parsed.data.expiresAtUtc ?? null,
        });
        return true;
      },
      clearSession: () => set(emptySession),
    }),
    {
      name: AUTH_SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAtUtc: state.expiresAtUtc,
      }),
      version: 1,
      onRehydrateStorage: () => (state, error) => {
        if (error != null || state == null) {
          return;
        }
        const parsed = authSessionPersistedSchema.safeParse({
          accessToken: state.accessToken,
          expiresAtUtc: state.expiresAtUtc,
        });
        if (!parsed.success) {
          useAuthSessionStore.getState().clearSession();
          return;
        }
        const exp = parsed.data.expiresAtUtc;
        if (exp) {
          const ms = Date.parse(exp);
          if (!Number.isNaN(ms) && ms < Date.now()) {
            useAuthSessionStore.getState().clearSession();
          }
        }
      },
    },
  ),
);

/** Prefer in-memory store after rehydration; fall back to validated disk read. */
export function getAccessToken(): string | null {
  const fromStore = useAuthSessionStore.getState().accessToken;
  if (fromStore) {
    return fromStore;
  }
  return readPersistedAccessToken();
}
