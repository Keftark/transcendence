#!/usr/bin/bash

echo "HOST_ADDRESS=$(ip addr | awk '/enp0s3/{f=1} f && /inet/{print $2; exit}' | cut -d'/' -f1)" > .env
export HOST_ADDRESS=$(ip addr | awk '/enp0s3/{f=1} f && /inet/{print $2; exit}' | cut -d'/' -f1)

echo "UPDATE_DELAY=0.016" >> .env
echo "PORT_DJANGO=8000" >> .env
echo "PORT_CENTRAL=7777" >> .env
echo "PORT_CHAT=7878" >> .env
echo "PORT_1V1_CLASSIC=8001" >> .env
echo "PORT_1VIA_CLASSIC=8011" >> .env
echo "PORT_2V2_CLASSIC=8003" >> .env
echo "PORT_1V1_BRICKS=8002" >> .env
echo "PORT_1VIA_BRICKS=8012" >> .env
echo "PORT_2V2_BRICKS=8013" >> .env
echo "DEBUG=True" >> .env
echo "DJANGO_LOGLEVEL=info" >> .env
echo "DJANGO_ALLOWED_HOSTS=*" >> .env
echo "DATABASE_ENGINE=postgresql_psycopg2" >> .env
echo "DATABASE_NAME=postgres" >> .env
echo "DATABASE_USERNAME=postgres" >> .env
echo "DATABASE_PASSWORD=1234" >> .env
echo "DATABASE_HOST=db" >> .env
echo "DATABASE_PORT=5431" >> .env
echo "DJANGO_SECRET_KEY=\"django-insecure-@uut+0=vr4zv$i5p_h$1he&g$+^1k3*o0+*yhv71u#@7i#p&e3\"" >> .env