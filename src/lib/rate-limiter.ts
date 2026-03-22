// =====================================================
// RATE LIMITER
// Prevents abuse and ensures fair usage
// =====================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  check(
    key: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // New window
      const resetTime = now + windowMs;
      this.limits.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: maxRequests - 1, resetTime };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(key: string): void {
    this.limits.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  stats(): { totalEntries: number } {
    return { totalEntries: this.limits.size };
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.limits.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit presets
export const RateLimits = {
  // For read operations
  READ: { max: 200, window: 60000 }, // 200 requests per minute

  // For write operations
  WRITE: { max: 50, window: 60000 }, // 50 requests per minute

  // For authentication
  AUTH: { max: 10, window: 60000 }, // 10 attempts per minute

  // For purchases
  PURCHASE: { max: 20, window: 60000 }, // 20 purchases per minute

  // For withdrawals
  WITHDRAW: { max: 5, window: 60000 }, // 5 withdrawals per minute

  // For API in general
  API: { max: 100, window: 60000 }, // 100 requests per minute
};

// Helper function to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

// Rate limit key generators
export const RateLimitKeys = {
  api: (ip: string) => `api:${ip}`,
  auth: (ip: string) => `auth:${ip}`,
  user: (userId: string, action: string) => `user:${userId}:${action}`,
  purchase: (userId: string) => `purchase:${userId}`,
  withdraw: (userId: string) => `withdraw:${userId}`,
};
