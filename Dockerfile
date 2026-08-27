# ==============================================================================
# QAAGA Super Marketplace — Production Multi-Stage Dockerfile
# Optimized for Node.js 22 LTS, Fast Build Times, Minimal Attack Surface & Scalability
# ==============================================================================

# 1. Base Stage
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN npm ci --include=dev

# 3. Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run production build (Vite client build + esbuild server bundle)
RUN npm run build

# 4. Production Runner Stage
FROM base AS runner
WORKDIR /app

ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp

# Copy built application assets
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Ensure proper permissions
USER nodeapp

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
