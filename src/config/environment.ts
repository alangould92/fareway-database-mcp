/**
 * Environment Configuration
 * 
 * Centralized, type-safe environment variable management
 */

import { z } from 'zod';

const environmentSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8081),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  
  // Authentication
  MCP_API_KEY: z.string().min(32).optional(),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
  
  // Performance
  ENABLE_CACHE: z.coerce.boolean().default(true),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Monitoring
  ENABLE_TELEMETRY: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

/**
 * Parse and validate environment variables
 */
export function loadEnvironment(): Environment {
  const result = environmentSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  
  return result.data;
}

export const env = loadEnvironment();

