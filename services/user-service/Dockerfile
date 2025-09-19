FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ---- Development ----
FROM base AS development
ENV NODE_ENV=development
COPY run_dev.sh /usr/local/bin/run_dev.sh
RUN chmod +x /usr/local/bin/run_dev.sh
CMD ["/usr/local/bin/run_dev.sh"]

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
# Remove dev dependencies
RUN npm prune --omit=dev
CMD ["npm", "start"]