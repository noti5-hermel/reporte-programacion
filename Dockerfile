# Multi-stage build for React + Vite application

# Stage 1: Build the application
# Misma versión que .nvmrc y el entorno de desarrollo local.
FROM node:22.15.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# VITE_* se incrustan en el bundle durante el build. No copiar .env al contexto:
# los valores se pasan explícitamente como build args (ver docker-compose.yml).
ARG VITE_API_BASE_URL=""
ARG VITE_REPORTS_API_URL=""
ARG VITE_AUTH_API_URL=""
ARG VITE_AUTH_HEALTH_URL=""
ARG VITE_AUTH_FRONTEND_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_REPORTS_API_URL=$VITE_REPORTS_API_URL \
    VITE_AUTH_API_URL=$VITE_AUTH_API_URL \
    VITE_AUTH_HEALTH_URL=$VITE_AUTH_HEALTH_URL \
    VITE_AUTH_FRONTEND_URL=$VITE_AUTH_FRONTEND_URL

# Build the application
RUN npm run build

# Stage 2: Production image with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx.conf es una plantilla: el entrypoint oficial sustituye las variables
# de entorno (REPORTS_API_UPSTREAM / AUTH_API_UPSTREAM) al iniciar.
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV REPORTS_API_UPSTREAM=http://reports-api:8107 \
    AUTH_API_UPSTREAM=http://auth-api:8081

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
