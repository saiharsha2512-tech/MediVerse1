# Build step for the client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production server
FROM node:18-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production
COPY server/ ./

# Copy built client to server public directory
COPY --from=client-build /app/client/dist ./public/dist

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080
ENV PORT=8080

CMD ["node", "server.js"]
