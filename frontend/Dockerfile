FROM node:22-bullseye AS base
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install --only=prod

FROM base AS development
RUN npm install
CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]