# Multi-stage build for TanStack Start application
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Create non-root user for security
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app

# Install dependencies only when needed
FROM base AS deps
USER app
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
USER app
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ARG VITE_BASE_URL

RUN echo $VITE_BASE_URL
RUN pnpm run build

# Production image
FROM base AS runner
USER app
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Expose port (default for Nitro is 3000)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]
