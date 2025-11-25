/**
 * Main Entry Point
 * 
 * Fareway Database MCP Server
 */

import 'dotenv/config';
import { app } from './server.js';
import { env } from './config/environment.js';
import { logger } from './utils/logger.js';
import { testDatabaseConnection } from './utils/database.js';

async function start() {
  logger.info('🚀 Starting Fareway Database MCP Server', {
    environment: env.NODE_ENV,
    port: env.PORT,
  });
  
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    logger.error('❌ Database connection failed - exiting');
    process.exit(1);
  }
  
  // Start HTTP server
  app.listen(env.PORT, () => {
    logger.info(`✅ Server running on port ${env.PORT}`, {
      health_check: `http://localhost:${env.PORT}/health`,
      mcp_endpoint: `http://localhost:${env.PORT}/sse`,
      api_endpoint: `http://localhost:${env.PORT}/api/tools`,
    });
  });
}

start().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});

