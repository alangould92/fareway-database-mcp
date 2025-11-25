/**
 * Database Client
 * 
 * Centralized Supabase client with connection pooling and error handling
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/environment.js';
import { logger } from './logger.js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client (singleton)
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    logger.info('Initializing Supabase client', {
      url: env.SUPABASE_URL,
    });
    
    supabaseClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'x-application': 'fareway-database-mcp',
          },
        },
      }
    );
  }
  
  return supabaseClient;
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('golf_courses').select('id').limit(1);
    
    if (error) {
      logger.error('Database connection test failed', { error });
      return false;
    }
    
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection test error', { error });
    return false;
  }
}

/**
 * Gracefully close database connections
 */
export async function closeDatabaseConnections(): Promise<void> {
  // Supabase client doesn't need explicit closing
  // but we'll reset the singleton for clean shutdown
  supabaseClient = null;
  logger.info('Database connections closed');
}

