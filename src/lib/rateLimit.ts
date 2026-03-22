// =====================================================
// RATE LIMITING MIDDLEWARE
// Protects API endpoints from abuse
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator?: (req: NextRequest) => string;
}

// Default rate limit configs for different endpoints
export const RateLimits = {
  // Auth endpoints - stricter limits
  AUTH: { windowMs: 60000, maxRequests: 10 },      // 10 requests per minute
  LOGIN: { windowMs: 60000, maxRequests: 5 },      // 5 login attempts per minute

  // Financial operations - moderate limits
  PURCHASE: { windowMs: 60000, maxRequests: 30 },  // 30 purchases per minute
  WITHDRAW: { windowMs: 60000, maxRequests: 10 },  // 10 withdrawals per minute
  DEPOSIT: { windowMs: 60000, maxRequests: 20 },   // 20 deposits per minute

  // Read operations - relaxed limits
  READ: { windowMs: 60000, maxRequests: 100 },     // 100 reads per minute
  LIST: { windowMs: 60000, maxRequests: 60 },      // 60 list requests per minute

  // Admin operations
  ADMIN: { windowMs: 60000, maxRequests: 200 },    // 200 admin requests per minute
};

// In-memory fallback for rate limiting (used when DB is slow)
const memoryRateLimits = new Map<string, { count: number; resetAt: number }>();

// Clean up memory rate limits every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryRateLimits.entries()) {
    if (value.resetAt < now) {
      memoryRateLimits.delete(key);
    }
  }
}, 60000);

export async function withRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): Promise<NextResponse | null> {
  try {
    // Generate key based on IP or provided identifier
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               'unknown';
    const key = identifier || ip;
    const endpoint = new URL(req.url).pathname;
    const rateLimitKey = `${key}:${endpoint}`;

    const now = Date.now();
    const resetAt = new Date(now + config.windowMs);

    // Try database first, fall back to memory
    try {
      const existing = await db.rateLimit.findUnique({
        where: {
          identifier_endpoint: {
            identifier: rateLimitKey,
            endpoint,
          },
        },
      });

      if (existing) {
        if (existing.resetAt < new Date(now)) {
          // Window expired, reset counter
          await db.rateLimit.update({
            where: { id: existing.id },
            data: { count: 1, resetAt },
          });
        } else if (existing.count >= config.maxRequests) {
          // Rate limit exceeded
          return NextResponse.json(
            {
              success: false,
              error: 'Too many requests. Please try again later.',
              retryAfter: Math.ceil((existing.resetAt.getTime() - now) / 1000),
            },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((existing.resetAt.getTime() - now) / 1000)),
              },
            }
          );
        } else {
          // Increment counter
          await db.rateLimit.update({
            where: { id: existing.id },
            data: { count: { increment: 1 } },
          });
        }
      } else {
        // Create new rate limit record
        await db.rateLimit.create({
          data: {
            identifier: rateLimitKey,
            endpoint,
            count: 1,
            resetAt,
          },
        });
      }
    } catch {
      // Fall back to memory-based rate limiting
      const memoryLimit = memoryRateLimits.get(rateLimitKey);

      if (memoryLimit) {
        if (memoryLimit.resetAt < now) {
          memoryRateLimits.set(rateLimitKey, { count: 1, resetAt: now + config.windowMs });
        } else if (memoryLimit.count >= config.maxRequests) {
          return NextResponse.json(
            {
              success: false,
              error: 'Too many requests. Please try again later.',
              retryAfter: Math.ceil((memoryLimit.resetAt - now) / 1000),
            },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((memoryLimit.resetAt - now) / 1000)),
              },
            }
          );
        } else {
          memoryLimit.count++;
        }
      } else {
        memoryRateLimits.set(rateLimitKey, {
          count: 1,
          resetAt: now + config.windowMs,
        });
      }
    }

    return null; // No rate limit hit, continue
  } catch (error) {
    console.error('Rate limit error:', error);
    return null; // On error, allow request to continue
  }
}

// Helper to create rate-limited API handler
export function createRateLimitedHandler(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const rateLimitResponse = await withRateLimit(req, config);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(req);
  };
}
