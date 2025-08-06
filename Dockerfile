# Base image
FROM node:22.3.0-alpine

# Set working directory
WORKDIR /app

# Copy package and lock files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy the entire project
COPY . .

# Install backend and frontend deps (already handled by root in your case)

# Expose ports for backend and frontend dev servers
EXPOSE 3000 5173

# Default command: run backend and frontend in parallel (development only)
CMD ["sh", "-c", "npm run be:start & npm run fe:dev"]