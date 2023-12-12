# Stage 1: Build the application
FROM node:18.18.0-alpine as build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run the application
FROM node:18.18.0-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy built assets from the build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

# Expose the port the app runs on
EXPOSE 5400

# Start the application
CMD ["npm", "run", "start:prod"]
