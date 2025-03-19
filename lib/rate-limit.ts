import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"
import { headers } from "next/headers"

// Create a new Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Create different rate limiters for different actions
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1m"), // 5 requests per minute
  analytics: true,
  prefix: "ratelimit:auth",
})

export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1m"), // 20 requests per minute
  analytics: true,
  prefix: "ratelimit:api",
})

// Helper function to get client IP
export async function getClientIp() {
  const headersList = headers()
  return (await headersList).get("x-forwarded-for") || "anonymous"
}

// Rate limit middleware for server actions
export async function rateLimit(action: "auth" | "api" | "general", identifier?: string) {
  const ip = await getClientIp()
  const id = identifier ? `${ip}:${identifier}` : ip

  const limiter =
    action === "auth"
      ? authRateLimiter
      : action === "api"
        ? apiRateLimiter
        : new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(50, "1m"),
            analytics: true,
            prefix: "ratelimit:general",
          })

  const { success, limit, reset, remaining } = await limiter.limit(id)

  return {
    success,
    limit,
    reset,
    remaining,
    id,
  }
}

