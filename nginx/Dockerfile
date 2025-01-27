FROM	debian:buster

RUN		apt-get update
RUN		apt-get install -y nginx

COPY    nginx.conf /etc/nginx/nginx.conf

EXPOSE	443

CMD     ["nginx", "-g", "daemon off;"]