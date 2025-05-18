# Giai đoạn 1: Build frontend
FROM node:22 AS build-frontend

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Giai đoạn 2: Chạy backend
FROM node:22

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# ✅ Cài dependencies bên trong container (build lại bcrypt cho Linux)
RUN cd backend && npm install

# Copy backend source code (KHÔNG copy node_modules)
COPY backend ./backend

# Copy frontend đã build
COPY --from=build-frontend /app/dist ./backend/public

# Chạy app
WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.js"]
