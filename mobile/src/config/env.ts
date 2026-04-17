const DEFAULT_API_URL = "http://10.0.2.2:5000";

const normalizeApiUrl = (rawUrl: string) => {
  const trimmedUrl = rawUrl.trim();
  const fixedProtocolUrl = trimmedUrl
    .replace(/^http:\/(?!\/)/i, "http://")
    .replace(/^https:\/(?!\/)/i, "https://");

  // Generated Kubb endpoints already include `/api/...`.
  return fixedProtocolUrl.replace(/\/api\/?$/i, "");
};

const parsedApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const env = {
  apiUrl:
    parsedApiUrl && parsedApiUrl.length > 0
      ? normalizeApiUrl(parsedApiUrl)
      : DEFAULT_API_URL,
};
