FROM node:22-bullseye AS base
WORKDIR /app


FROM base AS development
COPY run_dev.sh /usr/local/bin/run_dev.sh
RUN chmod +x /usr/local/bin/run_dev.sh
CMD ["/usr/local/bin/run_dev.sh"]


FROM ./
COPY package-lock.js base AS production
COPY package.jsonon ./
RUN npm install --only=prod
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]