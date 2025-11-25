/**
 * Accommodation Tools
 * 
 * MCP tools for searching and retrieving accommodation information
 */

import { getSupabaseClient } from '../utils/database.js';
import { getCached, setCached } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import type {
  SearchAccommodationsParams,
  GetAccommodationDetailsParams,
  ToolResult,
} from '../types/tools.js';

/**
 * Search for accommodations
 */
export async function searchAccommodations(
  params: SearchAccommodationsParams
): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    const cacheKey = `accommodations:search:${JSON.stringify(params)}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached, metadata: { cached: true } };
    }
    
    const supabase = getSupabaseClient();
    let query = supabase
      .from('accommodations')
      .select(`
        id,
        name,
        type,
        region,
        rating,
        standard_rate_cents,
        description,
        amenities,
        location
      `);
    
    if (params.region) {
      query = query.ilike('region', `%${params.region}%`);
    }
    
    if (params.min_price_cents) {
      query = query.gte('standard_rate_cents', params.min_price_cents);
    }
    
    if (params.max_price_cents) {
      query = query.lte('standard_rate_cents', params.max_price_cents);
    }
    
    query = query.limit(params.limit || 20);
    query = query.order('rating', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('searchAccommodations failed', { error, params });
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }
    
    await setCached(cacheKey, data);
    
    const duration = Date.now() - startTime;
    logger.info('searchAccommodations completed', {
      params,
      results_count: data?.length || 0,
      duration_ms: duration,
    });
    
    return {
      success: true,
      data: data || [],
      metadata: {
        count: data?.length || 0,
        duration_ms: duration,
      },
    };
  } catch (error) {
    logger.error('searchAccommodations exception', { error, params });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get detailed accommodation information
 */
export async function getAccommodationDetails(
  params: GetAccommodationDetailsParams
): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    const cacheKey = `accommodation:details:${params.accommodation_id}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached, metadata: { cached: true } };
    }
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('id', params.accommodation_id)
      .single();
    
    if (error) {
      logger.error('getAccommodationDetails failed', { error, params });
      return {
        success: false,
        error: `Accommodation not found or database error: ${error.message}`,
      };
    }
    
    await setCached(cacheKey, data);
    
    const duration = Date.now() - startTime;
    return {
      success: true,
      data,
      metadata: { duration_ms: duration },
    };
  } catch (error) {
    logger.error('getAccommodationDetails exception', { error, params });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get golf resorts (accommodations with on-site courses)
 */
export async function getGolfResorts(region?: string): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    const cacheKey = `resorts:${region || 'all'}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached, metadata: { cached: true } };
    }
    
    const supabase = getSupabaseClient();
    let query = supabase
      .from('accommodations')
      .select('*')
      .eq('is_golf_resort', true);
    
    if (region) {
      query = query.ilike('region', `%${region}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }
    
    await setCached(cacheKey, data);
    
    const duration = Date.now() - startTime;
    return {
      success: true,
      data: data || [],
      metadata: {
        count: data?.length || 0,
        duration_ms: duration,
      },
    };
  } catch (error) {
    logger.error('getGolfResorts exception', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

