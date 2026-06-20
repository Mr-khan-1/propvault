# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the backend package.json files
COPY backend/package*.json ./backend/

# Install the dependencies
RUN cd backend && npm install --production

# Copy the rest of the backend source code
COPY backend/ ./backend/

# Expose the port Railway uses
EXPOSE 5000

# Start the application
CMD ["npm", "start", "--prefix", "backend"]
