# Simple Bun-based frontend
FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "src/server.js"]
