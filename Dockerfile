# Multi-stage Dockerfile for Next.js application

# Stage 1: Dependencies and Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package management files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy configuration and source code
COPY . .

# Build Next.js application
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built standalone app and static files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
