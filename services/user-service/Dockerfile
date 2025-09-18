FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ---- Development ----
FROM base AS development
ENV NODE_ENV=development
RUN npm install 
CMD ["npm", "run", "dev"]

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
# Remove dev dependencies
RUN npm prune --omit=dev
CMD ["npm", "start"]