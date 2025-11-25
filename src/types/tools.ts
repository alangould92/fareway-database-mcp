/**
 * Tool Type Definitions
 * 
 * Shared types for all MCP tools
 */

import { z } from 'zod';

/**
 * Base tool result interface
 */
export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Course search parameters
 */
export const SearchCoursesSchema = z.object({
  region: z.string().optional().describe('Region to search (e.g., "Southwest Ireland")'),
  course_type: z.enum(['links', 'parkland', 'resort', 'heathland']).optional(),
  min_price_cents: z.number().optional().describe('Minimum price in cents'),
  max_price_cents: z.number().optional().describe('Maximum price in cents'),
  limit: z.number().default(20).describe('Maximum number of results'),
});

export type SearchCoursesParams = z.infer<typeof SearchCoursesSchema>;

/**
 * Course details parameters
 */
export const GetCourseDetailsSchema = z.object({
  course_id: z.string().uuid().describe('UUID of the golf course'),
});

export type GetCourseDetailsParams = z.infer<typeof GetCourseDetailsSchema>;

/**
 * Recommended courses parameters
 */
export const GetRecommendedCoursesSchema = z.object({
  region: z.string().describe('Target region'),
  budget_tier: z.enum(['budget', 'standard', 'luxury']).describe('Budget category'),
  limit: z.number().default(10).describe('Maximum number of results'),
});

export type GetRecommendedCoursesParams = z.infer<typeof GetRecommendedCoursesSchema>;

/**
 * Accommodation search parameters
 */
export const SearchAccommodationsSchema = z.object({
  region: z.string().optional().describe('Region to search'),
  near_course_id: z.string().uuid().optional().describe('Find hotels near this course'),
  min_price_cents: z.number().optional(),
  max_price_cents: z.number().optional(),
  amenities: z.array(z.string()).optional().describe('Required amenities'),
  limit: z.number().default(20),
});

export type SearchAccommodationsParams = z.infer<typeof SearchAccommodationsSchema>;

/**
 * Accommodation details parameters
 */
export const GetAccommodationDetailsSchema = z.object({
  accommodation_id: z.string().uuid().describe('UUID of the accommodation'),
});

export type GetAccommodationDetailsParams = z.infer<typeof GetAccommodationDetailsSchema>;

/**
 * Supplier rates parameters
 */
export const GetSupplierRatesSchema = z.object({
  operator_id: z.string().uuid().describe('UUID of the tour operator'),
  supplier_type: z.enum(['golf_course', 'accommodation', 'transport', 'any']).optional(),
});

export type GetSupplierRatesParams = z.infer<typeof GetSupplierRatesSchema>;

/**
 * Check negotiated rate parameters
 */
export const HasNegotiatedRateSchema = z.object({
  operator_id: z.string().uuid(),
  supplier_id: z.string().uuid().describe('UUID of course or hotel'),
});

export type HasNegotiatedRateParams = z.infer<typeof HasNegotiatedRateSchema>;

