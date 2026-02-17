/**
 * Fetch with Timeout and Retry
 * 
 * Provides AbortController-based timeouts and exponential backoff retries
 * for edge function HTTP calls.
 */

interface FetchWithRetryOptions {
  /** Timeout in milliseconds (default: 90000 = 90s) */
  timeoutMs?: number;
  /** Max retry attempts (default: 1) */
  maxRetries?: number;
  /** Initial backoff in ms (default: 2000) */
  initialBackoffMs?: number;
  /** Only retry on these status codes (default: [502, 503, 504]) */
  retryOnStatus?: number[];
}

const DEFAULT_OPTIONS: Required<FetchWithRetryOptions> = {
  timeoutMs: 90_000,
  maxRetries: 1,
  initialBackoffMs: 2_000,
  retryOnStatus: [502, 503, 504],
};

/**
 * Fetch with timeout. Returns response or throws on timeout/network error.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = 90_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch with timeout and retry (for non-streaming calls).
 * Retries on 5xx errors with exponential backoff.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options?: FetchWithRetryOptions
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, init, opts.timeoutMs);

      if (response.ok || !opts.retryOnStatus.includes(response.status)) {
        return response;
      }

      // Retryable status code
      lastError = new Error(`HTTP ${response.status}`);
      console.warn(`Fetch attempt ${attempt + 1} failed with ${response.status}, retrying...`);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (e instanceof DOMException && e.name === "AbortError") {
        lastError = new Error(`Request timed out after ${opts.timeoutMs}ms`);
      }
      console.warn(`Fetch attempt ${attempt + 1} error: ${lastError.message}`);
    }

    // Backoff before retry (don't sleep after last attempt)
    if (attempt < opts.maxRetries) {
      const backoff = opts.initialBackoffMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }

  throw lastError || new Error("Fetch failed after retries");
}
