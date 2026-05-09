type FetchOptions = RequestInit & {
  retries?: number;
  retryDelayMs?: number;
};

const MAX_RETRIES = 5;

// Shared rate state (simple global limiter)
let lastRequestTime = 0;
let minIntervalMs = 0; // dynamically adjusted

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHeaderInt(headers: Headers, key: string): number | null {
  const value = headers.get(key);
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

export async function rateLimitedFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { retries = 0, retryDelayMs = 500, ...fetchOptions } = options;

  // Proactive throttling
  const now = Date.now();
  const waitTime = Math.max(0, lastRequestTime + minIntervalMs - now);

  if (waitTime > 0) {
    await sleep(waitTime);
  }

  lastRequestTime = Date.now();

  let response: Response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    // Network-level retry
    if (retries >= MAX_RETRIES) {
      throw new Error(`Network error: max retries exceeded (${err})`);
    }

    const backoff = retryDelayMs * 2 ** retries;
    await sleep(backoff);
    return rateLimitedFetch(url, {
      ...options,
      retries: retries + 1,
    });
  }

  // Extract rate limit headers
  const limit = getHeaderInt(response.headers, "X-PCO-API-Request-Rate-Limit");
  const count = getHeaderInt(response.headers, "X-PCO-API-Request-Rate-Count");
  const retryAfter = getHeaderInt(response.headers, "Retry-After");

  // Handle 429
  if (response.status === 429) {
    if (retries >= MAX_RETRIES) {
      throw new Error("Rate limit: max retries exceeded");
    }

    const delay = (retryAfter ?? 1) * 1000;
    await sleep(delay);

    return rateLimitedFetch(url, {
      ...options,
      retries: retries + 1,
    });
  }

  // Adaptive throttling
  if (limit && count) {
    const usageRatio = count / limit;

    if (usageRatio >= 0.9) {
      minIntervalMs = 1000; // aggressive slowdown
    } else if (usageRatio >= 0.75) {
      minIntervalMs = 500;
    } else {
      minIntervalMs = 0;
    }
  }

  // Retry on 5xx
  if (response.status >= 500) {
    if (retries >= MAX_RETRIES) {
      throw new Error(`Server error ${response.status}: max retries exceeded`);
    }

    const backoff = retryDelayMs * 2 ** retries;
    await sleep(backoff);

    return rateLimitedFetch(url, {
      ...options,
      retries: retries + 1,
    });
  }

  return response;
}
