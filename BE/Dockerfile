# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install Prisma dependencies and other build tools
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for Prisma CLI)
RUN npm ci && npm cache clean --force

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application source
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["npm", "start"]
