FROM nginx

RUN apt-get update && apt-get -y install openssl
RUN openssl req -x509 -newkey rsa:4096 -days 365 -nodes \
	-keyout /etc/ssl/private/cponmamju.fr_key.pem \
	-out /etc/ssl/certs/cponmamju.fr_cert.pem -sha256 \
	-subj "/C=FR/ST=76RPZ/L=LeHavre/ \
	O=42 Le Havre/CN=cponmamju.fr"

COPY nginx.conf /etc/nginx/nginx.conf