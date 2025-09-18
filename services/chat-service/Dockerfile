FROM node:22-bullseye AS base

WORKDIR /app

# copy only package files first
COPY package*.json ./

# install deps inside container
RUN npm i

# copy rest of the source (excluding node_modules because of .dockerignore)
COPY . .

EXPOSE 4545
CMD ["npm", "run", "dev"]
