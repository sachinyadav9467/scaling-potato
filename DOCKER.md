# Docker Setup Guide

This guide explains how to build and run the Daily Learning Tracker application using Docker.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later

## Quick Start

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=daily_learning_tracker
DB_PORT=5432

# Backend Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
CORS_ORIGIN=http://localhost:80

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Docker Ports
BACKEND_PORT=3000
FRONTEND_PORT=80
```

**Important:** Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to secure random strings in production!

### 2. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### 3. Access the Application

- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

## Individual Service Commands

### Build Individual Services

```bash
# Build frontend only
docker build -t daily-learning-frontend ./FE

# Build backend only
docker build -t daily-learning-backend ./BE
```

### Run Individual Services

#### Frontend
```bash
docker run -d \
  -p 80:80 \
  -e VITE_API_BASE_URL=http://localhost:3000/api/v1 \
  --name daily-learning-frontend \
  daily-learning-frontend
```

#### Backend
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/daily_learning_tracker \
  -e JWT_SECRET=your-secret-key \
  -e JWT_REFRESH_SECRET=your-refresh-secret-key \
  -e CORS_ORIGIN=http://localhost:80 \
  -v $(pwd)/BE/uploads:/app/uploads \
  --name daily-learning-backend \
  daily-learning-backend
```

## Database Migrations

The backend automatically runs migrations on startup when using docker-compose. If you need to run migrations manually:

```bash
# Using docker-compose
docker-compose exec backend npx prisma migrate deploy

# Or manually
docker exec -it daily-learning-backend npx prisma migrate deploy
```

## Development Mode

For development, you can mount your source code as volumes:

```yaml
# Add to docker-compose.yml for development
services:
  backend:
    volumes:
      - ./BE:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
```

## Troubleshooting

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart Services
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d daily_learning_tracker
```

### Clean Up
```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Production Considerations

1. **Security:**
   - Change all default passwords and secrets
   - Use strong JWT secrets
   - Configure proper CORS origins
   - Use HTTPS in production

2. **Performance:**
   - Use a reverse proxy (nginx/traefik) in front of containers
   - Configure proper resource limits
   - Use a managed database service for production

3. **Backups:**
   - Regularly backup the PostgreSQL volume
   - Backup uploads directory

4. **Monitoring:**
   - Set up health checks
   - Monitor container logs
   - Use container orchestration (Kubernetes, Docker Swarm) for production

## File Structure

```
.
├── docker-compose.yml          # Orchestration file
├── FE/
│   ├── Dockerfile              # Frontend container
│   └── .dockerignore
├── BE/
│   ├── Dockerfile              # Backend container
│   └── .dockerignore
└── DOCKER.md                   # This file
```
