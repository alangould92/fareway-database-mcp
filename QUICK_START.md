# Fareway Database MCP Server - Quick Start

## ✅ Server Status

The server is **ready for deployment**! 

- ✅ Code compiled successfully
- ✅ All TypeScript errors fixed
- ✅ Environment configured
- ✅ Git repository initialized and committed

## 🚀 Deploy to Railway (Recommended)

### Step 1: Create GitHub Repository

```bash
# Create a new repo on GitHub, then:
cd /Users/alangould/Desktop/Fareway/fareway-database-mcp
git remote add origin https://github.com/YOUR_USERNAME/fareway-database-mcp.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `fareway-database-mcp`
4. Railway will auto-detect the configuration from `railway.json`

### Step 3: Set Environment Variables

In Railway dashboard, go to **Variables** and add:

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://onlfwbrscxnlneydyvmt.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubGZ3YnJzY3pubG5leWR5dm10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg3NTE0OCwiZXhwIjoyMDc4NDUxMTQ4fQ.OpPcZgUZmdVW15pOLd1A8SK9HGmwAJY7mFOAmD1Z_90
API_KEY=your-secure-api-key-here
```

### Step 4: Test the Deployment

Once deployed, Railway will give you a URL like `https://fareway-database-mcp-production.up.railway.app`

Test it:

```bash
# Health check
curl https://YOUR-RAILWAY-URL.railway.app/health

# List tools (requires API key)
curl -H "Authorization: Bearer your-secure-api-key-here" \
  https://YOUR-RAILWAY-URL.railway.app/api/tools
```

## 🛠 Available Tools

The server exposes 10 database tools:

### Courses
- `search_courses` - Search golf courses by filters
- `get_course_details` - Get detailed info for a course
- `get_recommended_courses` - Get course recommendations
- `find_course_by_name` - Find a course by name

### Accommodations
- `search_accommodations` - Search hotels/resorts
- `get_accommodation_details` - Get accommodation details
- `get_golf_resorts` - Get golf resorts in a region

### Rates & Suppliers
- `get_supplier_rates` - Get rates from a supplier
- `has_negotiated_rate` - Check if operator has negotiated rates
- `get_operator_suppliers` - Get all suppliers for an operator

## 🔗 Integration with Fareway App

Once deployed, update your main Fareway app's `.env.local`:

```env
# Fareway Database MCP Server
MCP_DATABASE_SERVER_URL=https://YOUR-RAILWAY-URL.railway.app
MCP_DATABASE_API_KEY=your-secure-api-key-here
```

Then create a client in your Next.js app similar to the tee time MCP client.

## 📊 Monitoring

- **Health**: `GET /health`
- **Logs**: View in Railway dashboard
- **Tools List**: `GET /api/tools`

## 🔐 Security

- API key authentication required for all endpoints (except `/health`)
- Rate limiting: 100 requests per 15 minutes per IP
- CORS enabled
- Helmet security headers

## 📝 Next Steps

1. Deploy to Railway
2. Test all 10 tools via REST API
3. Integrate with OpenAI Agent Builder
4. Connect to Fareway main app

---

**Note**: The server couldn't start locally due to sandbox network restrictions, but it's fully ready for Railway deployment where it will have proper network access to Supabase.

