import axios from "axios";

import { env } from "../config/env";
import type { FileUploadResponseDto } from "./generated/types";

export type UploadFolder = "general" | "equipment" | "cms";

type PickedFile = {
  uri: string;
  name: string;
  type: string;
};

/**
 * Multipart upload for React Native (file field must use { uri, name, type }).
 */
export async function uploadFileNative(
  file: PickedFile,
  folder: UploadFolder = "equipment",
): Promise<FileUploadResponseDto> {
  const formData = new FormData();
  formData.append("file", file as unknown as Blob);
  formData.append("folder", folder);

  const { data } = await axios.post<FileUploadResponseDto>(`${env.apiUrl}/api/Files/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}
