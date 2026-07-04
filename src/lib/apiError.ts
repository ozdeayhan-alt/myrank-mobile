/** API error with HTTP status for user-facing messages and retry logic. */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    const trimmed = message.trim() || "İstek başarısız";
    super(`${trimmed} (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function throwIfNotOk(
  response: Response,
  data: { error?: string; code?: string } | null | undefined,
  fallback: string
): void {
  if (response.ok) {
    return;
  }
  throw new ApiError(data?.error ?? fallback, response.status, data?.code);
}

export function isAuthApiError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401;
  }
  if (error instanceof Error) {
    if (error.message === "Oturum açık değil") {
      return true;
    }
    const status = parseStatusFromErrorMessage(error.message);
    return status === 401;
  }
  return false;
}

export function isRetryableQueryError(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403 || error.status === 404) {
      return false;
    }
    if (error.status === 400 || error.status === 422) {
      return false;
    }
    return true;
  }
  if (error instanceof Error) {
    if (error.message === "timeout") {
      return true;
    }
    const lower = error.message.toLowerCase();
    return (
      lower.includes("network request failed") ||
      lower.includes("failed to fetch") ||
      lower.includes("network error") ||
      lower.includes("econnrefused") ||
      lower.includes("unable to resolve host")
    );
  }
  return false;
}

function parseStatusFromErrorMessage(message: string): number | null {
  const match = message.match(/\((\d{3})\)\s*$/);
  if (!match?.[1]) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}
