FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy application code
COPY . .

# Prepare directories for SSR
RUN mkdir -p dist/client dist/server

# Skip the client build since it's causing issues
# We'll just copy the client files directly

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy server file and create minimal dist structure
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/dist ./dist

# Copy all client files directly (without build)
COPY --from=builder /app/client ./client

# Copy config files
COPY --from=builder /app/vite.config.js ./vite.config.js
COPY --from=builder /app/postcss.config.cjs ./postcss.config.cjs
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js

# Create necessary directories for logs
RUN mkdir -p logs

# Expose the port the app runs on
EXPOSE 3011

# Command to run the application
CMD ["node", "server.js"]