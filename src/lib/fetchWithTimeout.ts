const DEFAULT_TIMEOUT_MS = 20000;

function linkAbortSignals(
  timeoutMs: number,
  externalSignal?: AbortSignal | null
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);
  if (externalSignal?.aborted) {
    controller.abort();
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      externalSignal?.removeEventListener("abort", onExternalAbort);
    },
  };
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: externalSignal, ...fetchInit } =
    init;
  const { signal, cleanup } = linkAbortSignals(timeoutMs, externalSignal);

  try {
    return await fetch(url, {
      ...fetchInit,
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      if (externalSignal?.aborted) {
        throw error;
      }
      throw new Error("Sunucu yanıt vermedi. Lütfen tekrar deneyin.");
    }
    throw error;
  } finally {
    cleanup();
  }
}
