# Fareway Database MCP Server 🎯

Production-grade Model Context Protocol (MCP) server providing AI agents with secure, performant access to Fareway's golf tour database.

## 🌟 Features

### Enterprise-Grade Architecture
- **Type-Safe**: Full TypeScript with strict mode
- **Performant**: Connection pooling, caching, and optimized queries
- **Secure**: API key auth, rate limiting, RLS enforcement
- **Observable**: Structured logging, health checks, metrics
- **Scalable**: Horizontal scaling ready, Redis support

### MCP Tools Exposed

#### Course Tools
- `search_courses` - Search courses by region, type, price range
- `get_course_details` - Get comprehensive course information
- `get_recommended_courses` - AI-optimized course recommendations
- `find_course_by_name` - Fuzzy search by course name

#### Accommodation Tools
- `search_accommodations` - Find hotels near courses/regions
- `get_accommodation_details` - Detailed hotel information
- `get_golf_resorts` - Find stay-and-play properties

#### Pricing & Rates Tools
- `get_supplier_rates` - Get operator's negotiated rates
- `has_negotiated_rate` - Quick check for special pricing
- `get_operator_suppliers` - List operator's supplier relationships

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with Supabase credentials

# Run in development mode
npm run dev
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

### Docker

```bash
# Build image
docker build -t fareway-database-mcp .

# Run
docker run -p 8081:8081 --env-file .env fareway-database-mcp
```

## 📡 API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics (if enabled)

### MCP Protocol
- `GET /sse` - Server-Sent Events for MCP communication
- `POST /api/tools/{tool_name}` - Direct REST API access (for testing)

## 🔒 Security

### Authentication
All requests require API key authentication:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:8081/api/tools/search_courses
```

### Rate Limiting
- Default: 100 requests per minute per API key
- Configurable via environment variables

### Row-Level Security
All database queries respect Supabase RLS policies.

## 🎯 Tool Usage Examples

### Search Courses

```typescript
{
  "name": "search_courses",
  "arguments": {
    "region": "Southwest Ireland",
    "course_type": "links",
    "max_price_cents": 50000,
    "limit": 10
  }
}
```

### Get Supplier Rates

```typescript
{
  "name": "get_supplier_rates",
  "arguments": {
    "operator_id": "uuid-here",
    "supplier_type": "golf_course"
  }
}
```

## 📊 Monitoring

### Structured Logging
All logs are JSON-formatted for easy parsing:

```json
{
  "timestamp": "2024-11-25T20:00:00.000Z",
  "level": "info",
  "tool": "search_courses",
  "duration_ms": 145,
  "success": true,
  "results_count": 8
}
```

### Health Checks
```bash
curl http://localhost:8081/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 3600,
  "database": "connected",
  "cache": "connected"
}
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  HTTP/SSE Server (Express)              │
│  - Authentication middleware            │
│  - Rate limiting                        │
│  - Request validation                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  MCP Server Core                        │
│  - Tool registry                        │
│  - Request routing                      │
│  - Response formatting                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Tool Implementations                   │
│  - Course tools                         │
│  - Accommodation tools                  │
│  - Rate tools                           │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────┐      ┌──────────┐
│ Supabase │      │  Redis   │
│  (DB)    │      │ (Cache)  │
└──────────┘      └──────────┘
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test:coverage

# Type check
npm run typecheck
```

## 📦 Deployment

### Railway

1. Push to GitHub
2. Connect Railway to your repo
3. Set root directory: `fareway-database-mcp`
4. Configure environment variables
5. Deploy!

### Environment Variables (Production)

Required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `MCP_API_KEY`

Optional:
- `REDIS_URL` (for caching)
- `PORT` (default: 8081)
- `LOG_LEVEL` (default: info)

## 🔧 Configuration

### Cache Settings
```env
ENABLE_CACHE=true
CACHE_TTL_SECONDS=300
```

### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📄 License

Proprietary - Fareway Technologies

## 🤝 Support

For issues or questions, contact the Fareway development team.

---

Built with ❤️ for the future of golf tour operations

