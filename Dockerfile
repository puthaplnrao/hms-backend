# Base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy rest of the backend source code
COPY . .

# Expose the port your server runs on
EXPOSE 5000

# Run the server
CMD ["node", "server.js"]
