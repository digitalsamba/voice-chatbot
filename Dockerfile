FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Copy client assets and config files
COPY --from=builder /app/client/assets ./client/assets
COPY --from=builder /app/client/base.css ./client/base.css
COPY --from=builder /app/vite.config.js ./vite.config.js
COPY --from=builder /app/postcss.config.cjs ./postcss.config.cjs
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js

# Create necessary directories for logs
RUN mkdir -p logs

# Expose the port the app runs on
EXPOSE 3011

# Command to run the application
CMD ["node", "server.js"]