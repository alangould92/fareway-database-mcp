/**
 * HTTP Server with MCP Protocol Support
 * 
 * Production-grade Express server with:
 * - MCP protocol via SSE
 * - REST API for direct tool access
 * - Authentication & rate limiting
 * - Health checks & monitoring
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { env } from './config/environment.js';
import { logger, logToolExecution, logError } from './utils/logger.js';
import { testDatabaseConnection, closeDatabaseConnections } from './utils/database.js';
import { closeCache } from './utils/cache.js';
import { tools, getTool, listTools } from './tools/index.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Request logging
app.use((req, _res, next) => {
  logger.info('HTTP request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Auth middleware for API routes (optional if MCP_API_KEY is set)
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!env.MCP_API_KEY) {
    return next(); // No auth required if API key not configured
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  if (token !== env.MCP_API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  next();
}

// Create MCP server
const mcpServer = new Server(
  {
    name: 'fareway-database-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register MCP tool handlers
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: listTools().map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: {
        type: 'object',
        properties: t.inputSchema.shape || {},
        required: Object.keys(t.inputSchema.shape || {}),
      },
    })),
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();
  
  try {
    const tool = getTool(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }
    
    // Validate and execute tool
    const validatedArgs = tool.inputSchema.parse(args);
    const result = await tool.execute(validatedArgs);
    
    const duration = Date.now() - startTime;
    logToolExecution(name, duration, result.success, {
      args_keys: Object.keys(args || {}),
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logToolExecution(name, duration, false);
    logError(error as Error, { tool: name, args });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbConnected = await testDatabaseConnection();
  
  res.json({
    status: dbConnected ? 'healthy' : 'degraded',
    version: '1.0.0',
    uptime_seconds: process.uptime(),
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// MCP SSE endpoint
app.get('/sse', authMiddleware, async (_req, res) => {
  logger.info('SSE connection established');
  
  const transport = new SSEServerTransport('/messages', res);
  await mcpServer.connect(transport);
});

// REST API endpoints for direct tool access (for testing/debugging)
app.post('/api/tools/:toolName', authMiddleware, async (req, res): Promise<void> => {
  const { toolName } = req.params;
  const startTime = Date.now();
  
  try {
    const tool = getTool(toolName);
    if (!tool) {
      res.status(404).json({
        success: false,
        error: `Tool '${toolName}' not found`,
      });
      return;
    }
    
    const validatedArgs = tool.inputSchema.parse(req.body);
    const result = await tool.execute(validatedArgs);
    
    const duration = Date.now() - startTime;
    logToolExecution(toolName, duration, result.success);
    
    res.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    logToolExecution(toolName, duration, false);
    logError(error as Error, { tool: toolName, body: req.body });
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// List all available tools
app.get('/api/tools', authMiddleware, (_req, res) => {
  res.json({
    tools: listTools(),
    count: tools.length,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not found',
    available_endpoints: [
      'GET /health',
      'GET /sse',
      'GET /api/tools',
      'POST /api/tools/:toolName',
    ],
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logError(err, {
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down gracefully...');
  
  await closeDatabaseConnections();
  await closeCache();
  
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app };

