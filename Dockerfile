# Fareway Database MCP Server - Production Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production --ignore-scripts

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN useradd -r -u 1001 fareway && \
    chown -R fareway:fareway /app

USER fareway

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8081/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start server
CMD ["node", "dist/index.js"]

