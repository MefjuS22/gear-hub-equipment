import { gearhubApiClientOptions } from "./clientOptions";
import { postApiFilesUpload, type FileUploadResponseDto } from "./generated";

export type UploadFolder = "general" | "equipment" | "cms";

export type FileUploadResponse = FileUploadResponseDto;

/** POST multipart via generated client; use absoluteUrl or resolvePublicFileUrl(publicPath) in img src. */
export async function uploadFile(
  file: File,
  folder: UploadFolder = "general",
): Promise<FileUploadResponse> {
  return postApiFilesUpload({ file, folder }, gearhubApiClientOptions);
}

/** Join API base URL with a path such as `/files/cms/….png` (for display when HTML stores relative paths). */
export function resolvePublicFileUrl(publicPath: string): string {
  const base = (gearhubApiClientOptions.baseURL ?? "").replace(/\/$/, "");
  const path = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  return `${base}${path}`;
}
