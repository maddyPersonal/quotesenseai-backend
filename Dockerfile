# Use Node 18 LTS
FROM node:18-alpine
 
# Create app directory
WORKDIR /app
 
# Copy package files
COPY package*.json ./
 
# Install production dependencies
RUN npm install --production
 
# Copy entire project
COPY . .
 
# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production
 
# Expose the port Railway will use
EXPOSE 8080
 
# Start the server
CMD ["npm", "start"]