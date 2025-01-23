FROM nginx

RUN		apt-get update
RUN		apt-get install -y nginx

COPY cponmamju.fr_key.pem /etc/ssl/private/
COPY cponmamju.fr_cert.pem /etc/ssl/certs/

COPY nginx.conf /etc/nginx/nginx.conf