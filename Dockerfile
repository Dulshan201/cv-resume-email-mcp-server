# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy server source code
COPY server/ ./

# Build the server with skip lib check
RUN npx tsc --skipLibCheck

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
