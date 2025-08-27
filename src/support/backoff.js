/**
 * @fileoverview A simple exponential backoff utility
 */

const defaultOptions = {
  maxRetries: 5,
  initialDelay: 100,
  factor: 2,
  jitter: true,
  shouldRetry: (err) => [429, 500, 503].includes(err.response?.status) || err.code == 429,
  onRetry: () => {},
};

/**
 * Executes a function with exponential backoff.
 * @param {function(): Promise<any>} func The async function to execute.
 * @param {object} [options] - The options for the backoff.
 * @param {number} [options.maxRetries=5] - The maximum number of retries.
 * @param {number} [options.initialDelay=100] - The initial delay in ms.
 * @param {number} [options.factor=2] - The exponential factor.
 * @param {boolean} [options.jitter=true] - Whether to add random jitter to the delay.
 * @param {function(Error): boolean} [options.shouldRetry] - A function that returns true if a retry should be attempted.
 * @param {function(Error, number, number): void} [options.onRetry] - A function to call before a retry (err, attempt, delay).
 * @returns {Promise<{result: any, attempts: number}>} The result of the function and the number of attempts.
 */
export const withExponentialBackoff = async (func, options = {}) => {
  const { maxRetries, initialDelay, factor, jitter, shouldRetry, onRetry } = {
    ...defaultOptions,
    ...options,
  };

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await func();
      return { result, attempts: attempt + 1 };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && shouldRetry(err)) {
        const delay = initialDelay * (factor ** attempt);
        const jitterValue = jitter ? Math.floor(Math.random() * initialDelay) : 0;
        const totalDelay = delay + jitterValue;
        onRetry(err, attempt + 1, totalDelay);
        await new Promise((resolve) => setTimeout(resolve, totalDelay));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
};
