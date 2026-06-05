import { isAxiosError } from "axios";
import type { ApiErrorCode, ApiErrorResponse } from "../api/generated/types";
import { apiErrorCodeEnum } from "../api/generated/types";

export type { ApiErrorCode, ApiErrorResponse };
export { apiErrorCodeEnum };

const knownErrorCodes = new Set<string>(Object.values(apiErrorCodeEnum));

export type ParsedApiError = {
  code: ApiErrorCode | string;
  message: string;
  fieldErrors?: NonNullable<ApiErrorResponse["errors"]>;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function parseCode(raw: unknown): ApiErrorCode | string {
  if (typeof raw !== "string") {
    return apiErrorCodeEnum.unknown;
  }
  return knownErrorCodes.has(raw) ? (raw as ApiErrorCode) : raw;
}

function normalizeFieldErrors(raw: unknown): ParsedApiError["fieldErrors"] {
  if (!isRecord(raw)) return undefined;
  const out: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (Array.isArray(val) && val.every((v) => typeof v === "string")) {
      out[key] = val;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function parseApiError(err: unknown): ParsedApiError {
  if (isAxiosError(err)) {
    const data = err.response?.data;
    if (isRecord(data) && typeof data.message === "string") {
      return {
        code: parseCode(data.code),
        message: data.message,
        fieldErrors: normalizeFieldErrors(data.errors),
      };
    }
    return { code: apiErrorCodeEnum.unknown, message: err.message };
  }
  if (err instanceof Error) {
    return { code: apiErrorCodeEnum.unknown, message: err.message };
  }
  return { code: apiErrorCodeEnum.unknown, message: String(err) };
}

export function formatApiErrorForDisplay(parsed: ParsedApiError): string {
  const lines = [parsed.message];
  if (parsed.fieldErrors) {
    for (const [field, msgs] of Object.entries(parsed.fieldErrors)) {
      for (const m of msgs) {
        lines.push(`${field}: ${m}`);
      }
    }
  }
  return lines.join("\n");
}
