/**
 * Rates & Supplier Tools
 * 
 * MCP tools for accessing negotiated rates and supplier relationships
 */

import { getSupabaseClient } from '../utils/database.js';
import { getCached, setCached } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import type {
  GetSupplierRatesParams,
  HasNegotiatedRateParams,
  ToolResult,
} from '../types/tools.js';

/**
 * Get operator's negotiated supplier rates
 */
export async function getSupplierRates(
  params: GetSupplierRatesParams
): Promise<ToolResult> {
  const startTime = Date.now();
  
  try {
    const cacheKey = `rates:${params.operator_id}:${params.supplier_type || 'all'}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached, metadata: { cached: true } };
    }
    
    const supabase = getSupabaseClient();
    let query = supabase
      .from('operator_supplier_rates')
      .select(`
        id,
        operator_id,
        supplier_id,
        supplier_type,
        rate_cents,
        discount_percentage,
        valid_from,
        valid_until,
        notes
      `)
      .eq('operator_id', params.operator_id);
    
    if (params.supplier_type && params.supplier_type !== 'any') {
      query = query.eq('supplier_type', params.supplier_type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('getSupplierRates failed', { error, params });
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }
    
    await setCached(cacheKey, data, 600); // Cache for 10 minutes
    
    const duration = Date.now() - startTime;
    logger.info('getSupplierRates completed', {
      operator_id: params.operator_id,
      rates_count: data?.length || 0,
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
    logger.error('getSupplierRates exception', { error, params });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Quick check if operator has negotiated rate with supplier
 */
export async function hasNegotiatedRate(
  params: HasNegotiatedRateParams
): Promise<ToolResult> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('operator_supplier_rates')
      .select('id, rate_cents, discount_percentage')
      .eq('operator_id', params.operator_id)
      .eq('supplier_id', params.supplier_id)
      .single();
    
    if (error || !data) {
      return {
        success: true,
        data: { has_rate: false },
      };
    }
    
    return {
      success: true,
      data: {
        has_rate: true,
        rate_cents: data.rate_cents,
        discount_percentage: data.discount_percentage,
      },
    };
  } catch (error) {
    logger.error('hasNegotiatedRate exception', { error, params });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get operator's supplier relationships
 */
export async function getOperatorSuppliers(
  operatorId: string
): Promise<ToolResult> {
  try {
    const cacheKey = `suppliers:${operatorId}`;
    const cached = await getCached(cacheKey);
    if (cached) {
      return { success: true, data: cached, metadata: { cached: true } };
    }
    
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('operator_supplier_rates')
      .select(`
        supplier_id,
        supplier_type,
        rate_cents,
        discount_percentage
      `)
      .eq('operator_id', operatorId);
    
    if (error) {
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }
    
    await setCached(cacheKey, data, 600);
    
    return {
      success: true,
      data: data || [],
      metadata: { count: data?.length || 0 },
    };
  } catch (error) {
    logger.error('getOperatorSuppliers exception', { error, operatorId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

