FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Development ----
    FROM base AS development
    ENV NODE_ENV=development
    COPY run_dev.sh /usr/local/bin/run_dev.sh
    RUN chmod +x /usr/local/bin/run_dev.sh
    CMD ["/usr/local/bin/run_dev.sh"]
    
    # ---- Production ----
FROM base AS production
ENV NODE_ENV=production
COPY . .
# Remove dev dependencies
# RUN npm prune --omit=dev
RUN RUN npm install --only=prod
RUN npm run build
CMD ["npm", "start"]