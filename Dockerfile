# Stage 1: Build the React frontend static assets
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Set up the production runner
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Install production backend dependencies
RUN npm install --only=production
# Copy backend code files
COPY . .
# Copy compiled frontend from frontend-builder stage to serve statically
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose port (Google Cloud Run automatically injects $PORT)
EXPOSE 3000

# Start Express server which serves backend endpoints and SPA frontend dist
CMD ["node", "server.js"]
