# Deployment Guide

## 🚀 Quick Deploy to Railway

### Prerequisites
1. Railway account (https://railway.app)
2. Supabase credentials from main Fareway app
3. GitHub repository access

### Step 1: Prepare Environment Variables

Copy these from your main Fareway app `.env.local`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (use service role key, not anon key)

Generate a secure API key:
```bash
openssl rand -base64 32
```

### Step 2: Deploy to Railway

#### Option A: Deploy from GitHub (Recommended)

1. Push this directory to GitHub:
```bash
cd fareway-database-mcp
git init
git add .
git commit -m "Initial commit: Fareway Database MCP Server"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. In Railway Dashboard:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set **Root Directory**: `fareway-database-mcp`
   - Railway will auto-detect the Docker file

3. Add Environment Variables:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_KEY` - Service role key (not anon key!)
   - `MCP_API_KEY` - The secure key you generated
   - `NODE_ENV=production`

4. Deploy!

#### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set SUPABASE_URL="your_url"
railway variables set SUPABASE_SERVICE_KEY="your_key"
railway variables set MCP_API_KEY="your_api_key"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

### Step 3: Verify Deployment

Once deployed, Railway will give you a URL (e.g., `https://fareway-db-mcp.up.railway.app`)

Test it:
```bash
# Health check
curl https://your-railway-url.up.railway.app/health

# List tools (requires auth)
curl -H "Authorization: Bearer YOUR_MCP_API_KEY" \
  https://your-railway-url.up.railway.app/api/tools
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

### Step 4: Configure OpenAI Agent Builder

1. Go to OpenAI Platform (platform.openai.com)
2. Navigate to Agent Builder
3. Click "MCP" in the tools sidebar
4. Click "Connect to MCP Server"
5. Enter:
   - **URL**: `https://your-railway-url.up.railway.app/sse`
   - **Label**: `Fareway Database`
   - **Authentication**: Access token / API key
   - **Token**: Your `MCP_API_KEY`

6. Test connection - you should see 10 tools available

### Step 5: Test in Agent Builder

Try these prompts to test the tools:

```
Search for links courses in Southwest Ireland under €300
```

```
Find luxury accommodations in Dublin
```

```
Get negotiated rates for operator [your operator ID]
```

---

## 🔧 Local Development

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env

# Start development server
npm run dev
```

Server runs on http://localhost:8081

### Testing Tools

```bash
# Search courses
curl -X POST http://localhost:8081/api/tools/search_courses \
  -H "Content-Type: application/json" \
  -d '{"region": "Southwest Ireland", "limit": 5}'

# Get course details
curl -X POST http://localhost:8081/api/tools/get_course_details \
  -H "Content-Type: application/json" \
  -d '{"course_id": "your-course-uuid"}'
```

### TypeScript Compilation

```bash
# Type check
npm run typecheck

# Build
npm run build

# Run production build
npm start
```

---

## 📊 Monitoring

### Health Checks

Railway automatically monitors the `/health` endpoint.

### Logs

View logs in Railway dashboard or via CLI:
```bash
railway logs
```

Logs are structured JSON for easy parsing:
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

### Performance Metrics

Monitor in Railway dashboard:
- Response times
- Memory usage
- CPU usage
- Database connection pool

---

## 🔒 Security

### API Key Rotation

To rotate your MCP_API_KEY:

1. Generate new key:
```bash
openssl rand -base64 32
```

2. Update in Railway:
```bash
railway variables set MCP_API_KEY="new_key"
```

3. Update in OpenAI Agent Builder MCP settings

4. Railway will auto-restart the service

### Row-Level Security

All database queries respect Supabase RLS policies.

The service key has full access - ensure it's:
- Stored securely in Railway
- Never committed to Git
- Rotated periodically

---

## 🐛 Troubleshooting

### "Database connection failed"

Check:
1. `SUPABASE_URL` is correct
2. `SUPABASE_SERVICE_KEY` is the **service role key** (not anon key)
3. Supabase project is active
4. Network connectivity from Railway to Supabase

### "Tool not found"

Verify tool name matches exactly:
```bash
curl https://your-url/api/tools
```

### "Rate limit exceeded"

Default: 100 requests/minute

Increase via environment variables:
```bash
railway variables set RATE_LIMIT_MAX_REQUESTS=200
```

### "Authentication required"

Include Authorization header:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-url/api/tools/search_courses
```

---

## 📈 Scaling

### Horizontal Scaling

Railway supports multiple instances:

1. Go to project settings
2. Increase replicas
3. Railway load balances automatically

### Caching (Redis)

Enable Redis for better performance:

1. Add Redis service in Railway
2. Copy Redis URL
3. Set environment variables:
```bash
railway variables set REDIS_URL="redis://..."
railway variables set ENABLE_CACHE="true"
```

---

## 🔄 Updates

### Deploy New Version

```bash
# Commit changes
git add .
git commit -m "Update: description"
git push

# Railway auto-deploys from GitHub
```

### Manual Deploy

```bash
railway up
```

---

## 📞 Support

For issues or questions:
1. Check Railway logs: `railway logs`
2. Test health endpoint: `curl https://your-url/health`
3. Verify environment variables in Railway dashboard

---

Built with ❤️ for Fareway

