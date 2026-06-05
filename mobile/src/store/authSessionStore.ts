import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";

export const AUTH_SESSION_STORAGE_KEY = "gearhub-auth-session";

export const authSessionPersistedSchema = z.object({
  accessToken: z.string().min(1).nullable(),
  expiresAtUtc: z.string().nullable().optional(),
});

export type AuthSessionPersisted = z.infer<typeof authSessionPersistedSchema>;

const persistEnvelopeSchema = z.object({
  state: authSessionPersistedSchema,
  version: z.number().optional(),
});

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

export async function readPersistedAccessToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  const state = parsePersistedAuthEnvelope(raw);
  if (!state) {
    await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
  return state.accessToken;
}

export const authSessionFromApiSchema = z.object({
  accessToken: z.string().min(1),
  expiresAtUtc: z.string().nullable().optional(),
});

type AuthSessionState = AuthSessionPersisted & {
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
      storage: createJSONStorage(() => AsyncStorage),
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

export function getAccessToken(): string | null {
  return useAuthSessionStore.getState().accessToken;
}
