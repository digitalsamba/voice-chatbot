FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for development mode)
RUN npm install

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the port the app runs on
EXPOSE 3011

# Set permissions for mounted volumes
RUN chmod -R 777 /app/logs

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Command to run the application in development mode
CMD ["/app/start.sh"]