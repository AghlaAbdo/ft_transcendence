FROM node:22-bullseye AS base
WORKDIR /app
RUN mkdir logs
COPY package.json ./
COPY package-lock.json ./

FROM base AS development
COPY run_dev.sh /usr/local/bin/run_dev.sh
RUN chmod +x /usr/local/bin/run_dev.sh
CMD ["/usr/local/bin/run_dev.sh"]


FROM base AS production
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "start"]