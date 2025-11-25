#!/bin/bash

# Test Fareway Database MCP Server Deployment
# Usage: ./test-deployment.sh <RAILWAY_URL> <API_KEY>

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./test-deployment.sh <RAILWAY_URL> <API_KEY>"
  echo "Example: ./test-deployment.sh https://fareway-database-mcp.railway.app fareway-key-123"
  exit 1
fi

RAILWAY_URL="$1"
API_KEY="$2"

echo "🧪 Testing Fareway Database MCP Server"
echo "URL: $RAILWAY_URL"
echo ""

# Test 1: Health check
echo "1️⃣ Health Check (no auth)..."
curl -s "$RAILWAY_URL/health" | jq .
echo ""

# Test 2: List tools
echo "2️⃣ List Available Tools..."
curl -s -H "Authorization: Bearer $API_KEY" \
  "$RAILWAY_URL/api/tools" | jq '.count, .tools[].name'
echo ""

# Test 3: Search courses
echo "3️⃣ Search Courses in Ireland..."
curl -s -X POST \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"region": "Ireland", "limit": 3}' \
  "$RAILWAY_URL/api/tools/search_courses" | jq '.success, .count, .data[0].name'
echo ""

# Test 4: Search accommodations
echo "4️⃣ Search Accommodations in Dublin..."
curl -s -X POST \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"region": "Dublin", "limit": 2}' \
  "$RAILWAY_URL/api/tools/search_accommodations" | jq '.success, .count'
echo ""

# Test 5: Get operator suppliers
echo "5️⃣ Get Operator Suppliers..."
OPERATOR_ID="3e9dbbd1-5b80-4619-a80c-3ecd4a7be8f1"  # Carr Golf
curl -s -X POST \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"operator_id\": \"$OPERATOR_ID\"}" \
  "$RAILWAY_URL/api/tools/get_operator_suppliers" | jq '.success, .count'
echo ""

echo "✅ All tests completed!"
echo ""
echo "🔗 Available endpoints:"
echo "  - Health:     GET  $RAILWAY_URL/health"
echo "  - Tools List: GET  $RAILWAY_URL/api/tools"
echo "  - Execute:    POST $RAILWAY_URL/api/tools/:toolName"
echo "  - MCP SSE:    GET  $RAILWAY_URL/sse"

