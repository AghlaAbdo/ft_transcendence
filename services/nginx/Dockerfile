FROM node:22-bullseye AS base

RUN apt-get update  && \
    apt-get install -y nginx openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -out /etc/nginx/ssl/certificate.crt \
    -keyout /etc/nginx/ssl/priv_key.key \
    -subj "/C=MA/ST=Khouribga/O=1337/OU=1337/CN=Pong-Win/UID=thedon"

COPY ./config/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
