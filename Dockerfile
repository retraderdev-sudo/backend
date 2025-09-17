# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build Nest.js project (from TypeScript to JavaScript)
RUN npm run build

# Expose backend port
EXPOSE 4000

# Start the backend in production mode
CMD ["npm", "run", "start:prod"]
