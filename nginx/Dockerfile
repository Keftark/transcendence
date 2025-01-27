FROM	debian:buster

RUN		apt-get update
RUN		apt-get install -y nginx

COPY    cponmamju2.fr_key.pem /etc/ssl/private/

COPY    nginx.conf /etc/nginx/nginx.conf

EXPOSE	443

CMD     ["nginx", "-g", "daemon off;"]