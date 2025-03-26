interface RateLimitEntry {
    count: number;
    lastReset: number;
  }
  
  const store = new Map<string, RateLimitEntry>();
  
  export function createRateLimiter(options: { windowMs: number; max: number }) {
    return {
      limit(key: string) {
        const now = Date.now();
        const entry = store.get(key);
  
        // Reset if window expired
        if (!entry || now - entry.lastReset > options.windowMs) {
          store.set(key, { count: 1, lastReset: now });
          return { success: true, remaining: options.max - 1 };
        }
  
        // Check limit
        if (entry.count >= options.max) {
          return { success: false, remaining: 0 };
        }
  
        // Increment
        store.set(key, { ...entry, count: entry.count + 1 });
        return { success: true, remaining: options.max - entry.count - 1 };
      },
    };
  }