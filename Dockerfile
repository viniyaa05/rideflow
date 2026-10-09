# syntax=docker/dockerfile:1

# ====================================================
# Stage 1: Build the React Frontend with Vite
# ====================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies for Vite & Tailwind)
RUN npm ci

# Copy source code
COPY . .

# Build the production frontend into /app/dist
RUN npm run build

# ====================================================
# Stage 2: Lightweight Production Runtime
# ====================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy server files
COPY server/ ./server/

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Ensure data directory exists and set ownership to node user
RUN mkdir -p server/data && chown -R node:node /app

# Use non-root node user for container security
USER node

# Expose the application port
EXPOSE 5000

# Start the full-stack Express server
CMD ["node", "server/index.js"]
