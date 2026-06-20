FROM node:18-slim

WORKDIR /app

# Copy the root package.json if it exists
COPY package*.json ./

# Copy the backend folder
COPY backend/ ./backend/

# Install ONLY backend dependencies (we don't need the frontend on Railway)
RUN cd backend && npm install --production

# Expose port so Railway knows this is a web service and allows domain generation
EXPOSE 5000

# Set environment variable to bind to 0.0.0.0
ENV HOST=0.0.0.0

# Start the server directly
CMD ["node", "backend/server.js"]
