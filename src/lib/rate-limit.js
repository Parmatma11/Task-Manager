// Simple in-memory rate limiter for Next.js API routes (No external dependencies)
// Map of token -> { count, startTime }
const cache = new Map();

/**
 * Basic Rate Limiter
 * @param {Object} options
 * @param {string} options.uniqueToken - The identifier (e.g. IP or User ID)
 * @param {number} options.interval - Time window in milliseconds
 * @param {number} options.limit - Max requests per interval
 */
export async function rateLimit(options) {
  const { uniqueToken, interval, limit } = options;
  const now = Date.now();
  
  let entry = cache.get(uniqueToken);
  
  // Clean up if interval passed
  if (entry && now - entry.startTime > interval) {
    cache.delete(uniqueToken);
    entry = null;
  }
  
  if (!entry) {
    entry = { count: 1, startTime: now };
    cache.set(uniqueToken, entry);
  } else {
    entry.count += 1;
  }
  
  const isRateLimited = entry.count > limit;
  
  return {
    isRateLimited,
    currentUsage: entry.count,
    limit,
    remaining: isRateLimited ? 0 : limit - entry.count,
    resetTime: entry.startTime + interval
  };
}

// Cleanup task every minute to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [token, entry] of cache.entries()) {
      // Find the largest interval used in the app (e.g. 1 hour) or just use a default
      if (now - entry.startTime > 3600000) { 
        cache.delete(token);
      }
    }
  }, 60000);
}
