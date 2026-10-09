import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store para controle de requisições por IP
const ipRateLimitMap = new Map<string, RateLimitRecord>();

// Limpeza periódica para evitar acúmulo de memória
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipRateLimitMap.entries()) {
    if (now > record.resetTime) {
      ipRateLimitMap.delete(key);
    }
  }
}, 60000); // Executa a cada 1 minuto

export interface RateLimitOptions {
  limit: number;      // Número máximo de requisições permitidas
  windowMs: number;   // Janela de tempo em milissegundos
  prefix?: string;    // Prefixo para diferenciar rotas (ex: "auth-login", "ai-chat")
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }
  return "127.0.0.1";
}

export function checkRateLimit(
  req: Request,
  options: RateLimitOptions = { limit: 10, windowMs: 60000, prefix: "global" }
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  response?: NextResponse;
} {
  const ip = getClientIp(req);
  const key = `${options.prefix || "default"}:${ip}`;
  const now = Date.now();

  const record = ipRateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Nova janela
    ipRateLimitMap.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });

    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: Math.ceil((now + options.windowMs) / 1000),
    };
  }

  if (record.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    const response = NextResponse.json(
      {
        error: "Muitas requisições. Por segurança, aguarde alguns instantes antes de tentar novamente.",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": options.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(record.resetTime / 1000).toString(),
        },
      }
    );

    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
      response,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  };
}
