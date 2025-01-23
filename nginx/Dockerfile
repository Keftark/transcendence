FROM	debian:buster

RUN		apt-get update
RUN		apt-get install -y nginx

RUN	mkdir /etc/nginx/ssl

COPY cponmamju.fr_key.pem /etc/ssl/private/
COPY cponmamju.fr_cert.pem /etc/ssl/certs/

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE	443

CMD ["nginx", "-g", "daemon off;"]