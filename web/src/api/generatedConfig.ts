/**
 * Base URL for the Kubb axios client.
 * Empty string: dev — requesty idą na ten sam origin, Vite proxy (`vite.config.ts`) przekazuje `/api` → `http://localhost:5000`.
 * Ustaw `VITE_API_BASE_URL` jeśli front woła API bez proxy (np. preview).
 */
export const generatedClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
};
