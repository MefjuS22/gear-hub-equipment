import { getAccessToken } from "../store/authSessionStore";

type DownloadOptions = {
  path: string;
  fileName: string;
  mimeType?: string;
  queryParams?: Record<string, string | number | undefined>;
};

export async function downloadAuthenticatedFile({
  path,
  fileName,
  mimeType,
  queryParams,
}: DownloadOptions): Promise<void> {
  const token = getAccessToken();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const url = new URL(`${baseUrl}${path}`, window.location.origin);

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value != null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);

  if (mimeType && blob.type !== mimeType) {
    // Browser already downloaded; mime mismatch is non-fatal.
  }
}
