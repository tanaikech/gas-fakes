# Use Node.js base image
FROM node:22-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Change to the test directory and install test dependencies
WORKDIR /usr/src/app/test
RUN npm install

# Return to root for execution
WORKDIR /usr/src/app

# Expose port (Cloud Run expects a service to listen on PORT)
# Although this is a test script, Cloud Run often requires a port to be open.
# We'll use a simple node script that runs the test and then exits (or stays alive if needed).
ENV PORT 8080
EXPOSE 8080

# The entrypoint will be our specialized cloudrun.js script
CMD ["node", "test/cloudrun.js"]
