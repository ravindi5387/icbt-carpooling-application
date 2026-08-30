# ICBT Carpooling Application - Deployment

## Deployment Architecture

The ICBT Carpooling Application is designed to be deployed using Docker-based services.

- Frontend: React/Vite application served using Nginx
- Backend: Node.js/Express REST API
- Database: PostgreSQL
- Containerisation: Docker and Docker Compose
- CI: GitHub Actions

## Environment Variables

The production deployment uses environment variables for:

- DATABASE_URL
- JWT_SECRET
- FRONTEND_URL
- VITE_API_URL
- VITE_DEMO_MODE

Sensitive credentials are not stored in the source code.

## Deployment Verification

The deployed backend provides a health endpoint:

`/api/health`

This endpoint is used to verify that the backend API and database are available.
