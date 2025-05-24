# Giai đoạn 1: Build frontend
FROM node:22-slim AS build-frontend

WORKDIR /app

# Copy only package files first to leverage caching
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Remove dev dependencies and clean cache to reduce size
RUN npm prune --production && npm cache clean --force

# Giai đoạn 2: Chạy backend
FROM node:22-slim

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm install --production && npm cache clean --force

# Copy backend source code
COPY backend .

# Copy built frontend from previous stage
COPY --from=build-frontend /app/dist ./public

# Set non-root user for security
USER node

# Expose port and run app
EXPOSE 80
CMD ["node", "server.js"]