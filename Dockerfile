# Use an official Node.js image
FROM node:lts

# Set the working directory
WORKDIR /app

# Set environment variable for the port
ENV PORT=3000

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the server and worker using concurrently
CMD ["npx", "concurrently", "npx tsx server.ts", "npx tsx worker.ts"]
