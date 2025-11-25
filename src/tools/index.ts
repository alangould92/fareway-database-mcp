/**
 * Tool Registry
 * 
 * Central registry of all MCP tools with their schemas and implementations
 */

import {
  SearchCoursesSchema,
  GetCourseDetailsSchema,
  GetRecommendedCoursesSchema,
  SearchAccommodationsSchema,
  GetAccommodationDetailsSchema,
  GetSupplierRatesSchema,
  HasNegotiatedRateSchema,
} from '../types/tools.js';

import {
  searchCourses,
  getCourseDetails,
  getRecommendedCourses,
  findCourseByName,
} from './courses.js';

import {
  searchAccommodations,
  getAccommodationDetails,
  getGolfResorts,
} from './accommodations.js';

import {
  getSupplierRates,
  hasNegotiatedRate,
  getOperatorSuppliers,
} from './rates.js';

/**
 * Tool definition interface
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  execute: (params: any) => Promise<any>;
}

/**
 * All available MCP tools
 */
export const tools: ToolDefinition[] = [
  // Course Tools
  {
    name: 'search_courses',
    description: 'Search for golf courses by region, type, and price range. Returns a list of courses with basic information.',
    inputSchema: SearchCoursesSchema,
    execute: searchCourses,
  },
  {
    name: 'get_course_details',
    description: 'Get comprehensive details about a specific golf course including pricing, features, and contact information.',
    inputSchema: GetCourseDetailsSchema,
    execute: getCourseDetails,
  },
  {
    name: 'get_recommended_courses',
    description: 'Get AI-recommended courses for a region based on budget tier (budget/standard/luxury). Returns top-rated courses in price range.',
    inputSchema: GetRecommendedCoursesSchema,
    execute: getRecommendedCourses,
  },
  {
    name: 'find_course_by_name',
    description: 'Find courses by name using fuzzy search. Useful when user mentions specific course names.',
    inputSchema: { courseName: { type: 'string' } },
    execute: (params: { courseName: string }) => findCourseByName(params.courseName),
  },
  
  // Accommodation Tools
  {
    name: 'search_accommodations',
    description: 'Search for hotels and accommodations by region, amenities, and price range.',
    inputSchema: SearchAccommodationsSchema,
    execute: searchAccommodations,
  },
  {
    name: 'get_accommodation_details',
    description: 'Get detailed information about a specific accommodation including rooms, amenities, and rates.',
    inputSchema: GetAccommodationDetailsSchema,
    execute: getAccommodationDetails,
  },
  {
    name: 'get_golf_resorts',
    description: 'Find golf resorts (accommodations with on-site golf courses) perfect for stay-and-play packages.',
    inputSchema: { region: { type: 'string', optional: true } },
    execute: (params: { region?: string }) => getGolfResorts(params?.region),
  },
  
  // Rate & Supplier Tools
  {
    name: 'get_supplier_rates',
    description: "Get tour operator's negotiated rates with suppliers (courses, hotels, etc). Always check this for cost savings!",
    inputSchema: GetSupplierRatesSchema,
    execute: getSupplierRates,
  },
  {
    name: 'has_negotiated_rate',
    description: 'Quick check if operator has a special negotiated rate with a specific supplier.',
    inputSchema: HasNegotiatedRateSchema,
    execute: hasNegotiatedRate,
  },
  {
    name: 'get_operator_suppliers',
    description: "List all of an operator's supplier relationships and negotiated rates.",
    inputSchema: { operatorId: { type: 'string' } },
    execute: (params: { operatorId: string }) => getOperatorSuppliers(params.operatorId),
  },
];

/**
 * Get tool by name
 */
export function getTool(name: string): ToolDefinition | undefined {
  return tools.find(t => t.name === name);
}

/**
 * List all available tools
 */
export function listTools() {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

