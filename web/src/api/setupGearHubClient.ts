import { axiosInstance, setConfig } from "@kubb/plugin-client/clients/axios";

import { getAccessToken } from "../store/authSessionStore";
import { generatedClientConfig } from "./generatedConfig";

/**
 * Call once at startup: sets API base URL and attaches Bearer token from storage to every request.
 */
export function setupGearHubApiClient(): void {
  setConfig({
    baseURL: generatedClientConfig.baseURL || undefined,
  });

  axiosInstance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
