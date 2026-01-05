import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number;
}

export class RateLimiterService {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private config: RateLimitConfig | null = null;
  private lastConfigFetch: number = 0;
  private configCacheDuration = 60000; // 1 minute cache

  /**
   * Fetch rate limit configuration from database
   */
  private async fetchConfig(): Promise<RateLimitConfig> {
    const now = Date.now();
    
    // Use cached config if available and not expired
    if (this.config && (now - this.lastConfigFetch) < this.configCacheDuration) {
      return this.config;
    }

    try {
      const [enabledSetting, maxRequestsSetting, windowSetting] = await Promise.all([
        prisma.adminSettings.findUnique({ where: { key: 'enable_api_rate_limiting' } }),
        prisma.adminSettings.findUnique({ where: { key: 'api_rate_limit_max_requests' } }),
        prisma.adminSettings.findUnique({ where: { key: 'api_rate_limit_window_minutes' } })
      ]);

      this.config = {
        enabled: enabledSetting?.value as boolean ?? true,
        maxRequests: maxRequestsSetting?.value as number ?? 10000,
        windowMs: ((windowSetting?.value as number ?? 15) * 60 * 1000) // Convert minutes to ms
      };

      this.lastConfigFetch = now;
      return this.config;
    } catch (error) {
      console.error('Error fetching rate limit config:', error);
      // Return default config on error
      return {
        enabled: true,
        maxRequests: 10000,
        windowMs: 15 * 60 * 1000
      };
    }
  }

  /**
   * Create rate limiter middleware
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const config = await this.fetchConfig();

        // If rate limiting is disabled, skip
        if (!config.enabled) {
          return next();
        }

        const key = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();

        if (!this.requests.has(key)) {
          this.requests.set(key, { count: 1, resetTime: now + config.windowMs });
          return next();
        }

        const userData = this.requests.get(key)!;

        if (now > userData.resetTime) {
          this.requests.set(key, { count: 1, resetTime: now + config.windowMs });
          return next();
        }

        if (userData.count >= config.maxRequests) {
          const response: ApiResponse = {
            success: false,
            message: 'Too many requests, please try again later',
            error: 'Rate limit exceeded'
          };

          res.status(429).json(response);
          return;
        }

        userData.count++;
        next();
      } catch (error) {
        // On error, allow request to proceed (fail open)
        console.error('Rate limiter error:', error);
        next();
      }
    };
  }

  /**
   * Cleanup old entries periodically
   */
  startCleanup(intervalMs: number = 60000) {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.requests.entries()) {
        if (now > data.resetTime) {
          this.requests.delete(key);
        }
      }
    }, intervalMs);
  }

  /**
   * Get current rate limit configuration
   */
  async getConfig(): Promise<RateLimitConfig> {
    return this.fetchConfig();
  }

  /**
   * Update rate limit configuration
   */
  async updateConfig(config: Partial<RateLimitConfig>): Promise<void> {
    const updates: Promise<any>[] = [];

    if (config.enabled !== undefined) {
      updates.push(
        prisma.adminSettings.upsert({
          where: { key: 'enable_api_rate_limiting' },
          update: { value: config.enabled },
          create: {
            key: 'enable_api_rate_limiting',
            value: config.enabled,
            category: 'system',
            description: 'Enable or disable API rate limiting'
          }
        })
      );
    }

    if (config.maxRequests !== undefined) {
      updates.push(
        prisma.adminSettings.upsert({
          where: { key: 'api_rate_limit_max_requests' },
          update: { value: config.maxRequests },
          create: {
            key: 'api_rate_limit_max_requests',
            value: config.maxRequests,
            category: 'system',
            description: 'Maximum API requests allowed per window'
          }
        })
      );
    }

    if (config.windowMs !== undefined) {
      const minutes = Math.floor(config.windowMs / 60000);
      updates.push(
        prisma.adminSettings.upsert({
          where: { key: 'api_rate_limit_window_minutes' },
          update: { value: minutes },
          create: {
            key: 'api_rate_limit_window_minutes',
            value: minutes,
            category: 'system',
            description: 'Time window for rate limiting in minutes'
          }
        })
      );
    }

    await Promise.all(updates);
    
    // Clear cache to force reload
    this.config = null;
  }
}

// Export singleton instance
export const rateLimiterService = new RateLimiterService();
