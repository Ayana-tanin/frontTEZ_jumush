# Build stage
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
COPY package.json ./

# Expose port 3000
EXPOSE 3000

# Use the start script from package.json
CMD ["npm", "start"] 