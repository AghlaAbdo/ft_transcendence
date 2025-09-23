# FROM node:22-bullseye AS base

# WORKDIR /app

# # copy only package files first
# COPY package*.json ./

# # install deps inside container
# RUN npm i

# # copy rest of the source (excluding node_modules because of .dockerignore)
# # COPY . .

# EXPOSE 4545

# CMD ["npm", "run", "dev"]



FROM node:22-bullseye AS base
WORKDIR /app
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install --only=prod

FROM base AS development
COPY run_dev.sh /usr/local/bin/run_dev.sh
RUN chmod +x /usr/local/bin/run_dev.sh
CMD ["/usr/local/bin/run_dev.sh"]
# CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]