FROM node:22-bullseye AS base
WORKDIR /app
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install --only=prod

FROM base AS development
# RUN npm install

COPY run_dev.sh /usr/local/bin/run_dev.sh
RUN chmod +x /usr/local/bin/run_dev.sh
CMD ["/usr/local/bin/run_dev.sh"]
# CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]