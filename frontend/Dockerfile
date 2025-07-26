FROM node:22-bullseye

WORKDIR app/frontend

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]