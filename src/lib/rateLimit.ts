import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitKind = "audit" | "summary" | "leads";
type RateLimitHeaders = Record<string, string>;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

const limiters = redis
  ? {
      audit: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "spendscope:audit",
      }),
      summary: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(6, "1 m"),
        analytics: true,
        prefix: "spendscope:summary",
      }),
      leads: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(4, "1 m"),
        analytics: true,
        prefix: "spendscope:leads",
      }),
    }
  : null;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

export async function checkRateLimit(kind: RateLimitKind, request: Request) {
  if (!limiters) {
    return {
      allowed: true,
      headers: {} as RateLimitHeaders,
    };
  }

  const identifier = `${kind}:${getClientIp(request)}`;
  const result = await limiters[kind].limit(identifier);

  return {
    allowed: result.success,
    headers: {
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": result.reset.toString(),
    } satisfies RateLimitHeaders,
  };
}
