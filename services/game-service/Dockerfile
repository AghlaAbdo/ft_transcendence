FROM node:22-bullseye

WORKDIR app/backend

COPY . .

RUN npm install

EXPOSE 4000

CMD ["npm", "run", "dev"]