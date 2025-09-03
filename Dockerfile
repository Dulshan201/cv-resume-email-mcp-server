# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN cd server && npm install

# Copy source code
COPY . .

# Build the server
RUN cd server && npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
