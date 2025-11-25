/**
 * Course Tools
 * 
 * MCP tools for searching and retrieving golf course information
 */

import { getSupabaseClient } from '../utils/database.js';
import { getCached, setCached } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import type {
  SearchCoursesParams,
  GetCourseDetailsParams,
  GetRecommendedCoursesParams,
  ToolResult,
} from '../types/tools.js';

/**
 * Search for golf courses
 */
export async function searchCourses(
  params: SearchCoursesParams
): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    // Check cache
    const cacheKey = `courses:search:${JSON.stringify(params)}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      logger.info('Cache hit for searchCourses', { params });
      return { success: true, data: cached, metadata: { cached: true } };
    }
    
    const supabase = getSupabaseClient();
    let query = supabase
      .from('golf_courses')
      .select(`
        id,
        name,
        region,
        course_type,
        rating,
        difficulty_level,
        green_fee_standard_cents,
        description,
        location,
        features,
        created_at
      `);
    
    // Apply filters
    if (params.region) {
      query = query.ilike('region', `%${params.region}%`);
    }
    
    if (params.course_type) {
      query = query.eq('course_type', params.course_type);
    }
    
    if (params.min_price_cents) {
      query = query.gte('green_fee_standard_cents', params.min_price_cents);
    }
    
    if (params.max_price_cents) {
      query = query.lte('green_fee_standard_cents', params.max_price_cents);
    }
    
    query = query.limit(params.limit || 20);
    query = query.order('rating', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('searchCourses failed', { error, params });
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }
    
    // Cache results
    await setCached(cacheKey, data);
    
    const duration = Date.now() - startTime;
    logger.info('searchCourses completed', {
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
    logger.error('searchCourses exception', { error, params });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get detailed information about a specific course
 */
export async function getCourseDetails(
  params: GetCourseDetailsParams
): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    const cacheKey = `course:details:${params.course_id}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached, metadata: { cached: true } };
    }
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('golf_courses')
      .select('*')
      .eq('id', params.course_id)
      .single();
    
    if (error) {
      logger.error('getCourseDetails failed', { error, params });
      return {
        success: false,
        error: `Course not found or database error: ${error.message}`,
      };
    }
    
    await setCached(cacheKey, data);
    
    const duration = Date.now() - startTime;
    logger.info('getCourseDetails completed', {
      course_id: params.course_id,
      duration_ms: duration,
    });
    
    return {
      success: true,
      data,
      metadata: { duration_ms: duration },
    };
  } catch (error) {
    logger.error('getCourseDetails exception', { error, params });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get recommended courses based on budget and region
 */
export async function getRecommendedCourses(
  params: GetRecommendedCoursesParams
): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    const cacheKey = `courses:recommended:${JSON.stringify(params)}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached, metadata: { cached: true } };
    }
    
    // Budget tier price ranges (in cents)
    const priceRanges = {
      budget: { max: 15000 }, // Up to €150
      standard: { min: 15000, max: 35000 }, // €150-€350
      luxury: { min: 35000 }, // €350+
    };
    
    const range = priceRanges[params.budget_tier];
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('golf_courses')
      .select(`
        id,
        name,
        region,
        course_type,
        rating,
        difficulty_level,
        green_fee_standard_cents,
        description,
        features
      `)
      .ilike('region', `%${params.region}%`)
      .order('rating', { ascending: false })
      .limit(params.limit || 10);
    
    if ('min' in range && range.min !== undefined) {
      query = query.gte('green_fee_standard_cents', range.min);
    }
    
    if ('max' in range && range.max !== undefined) {
      query = query.lte('green_fee_standard_cents', range.max);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('getRecommendedCourses failed', { error, params });
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }
    
    await setCached(cacheKey, data);
    
    const duration = Date.now() - startTime;
    logger.info('getRecommendedCourses completed', {
      params,
      results_count: data?.length || 0,
      duration_ms: duration,
    });
    
    return {
      success: true,
      data: data || [],
      metadata: {
        count: data?.length || 0,
        budget_tier: params.budget_tier,
        duration_ms: duration,
      },
    };
  } catch (error) {
    logger.error('getRecommendedCourses exception', { error, params });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Find course by name (fuzzy search)
 */
export async function findCourseByName(courseName: string): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('golf_courses')
      .select('id, name, region, course_type, green_fee_standard_cents')
      .ilike('name', `%${courseName}%`)
      .limit(10);
    
    if (error) {
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }
    
    const duration = Date.now() - startTime;
    logger.info('findCourseByName completed', {
      search_term: courseName,
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
    logger.error('findCourseByName exception', { error, courseName });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

