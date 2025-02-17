#!/usr/bin/bash

#IP address
echo "HOST_ADDRESS=$(ip addr | awk '/wlp4s0/{f=1} f && /inet/{print $2; exit}' | cut -d'/' -f1)" > .env

#Ports
echo "PORT_DJANGO=8000" >> .env
echo "PORT_CENTRAL=7777" >> .env
echo "PORT_CHAT=7878" >> .env
echo "PORT_1V1_CLASSIC=8001" >> .env
echo "PORT_1VIA_CLASSIC=8011" >> .env
echo "PORT_2V2_CLASSIC=8003" >> .env
echo "PORT_1V1_BRICKS=8002" >> .env
echo "PORT_1VIA_BRICKS=8012" >> .env
echo "PORT_2V2_BRICKS=8013" >> .env

#Django stuff
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

#Game data
echo "UPDATE_DELAY=0.016" >> .env
echo "BALL_SPEED_INITIAL=0.7" >> .env
echo "BALL_SPEED_LIMIT=8" >> .env
echo "BALL_SPEED_INCREMENT=1.01" >> .env
echo "BALL_RADIUS=0.7" >> .env
#Logic : Each bounce on a paddle, the ball accelerates
#The speed is multiplied by BALL_SPEED_INCREMENT until it
#reaches BALL_SPEED_LIMIT

echo "BOARD_WIDTH=40" >> .env
echo "BOARD_HEIGTH=25" >> .env
#HxW is actually half of what it is in game
#Board goes from -w to w, not 0 to w

echo "PADDLE_SIZE_TALL=12" >> .env
echo "PADDLE_SIZE_SMALL=8" >> .env
echo "PADDLE_SPEED=0.75" >> .env
echo "PADDLE_POWER_PER_BOUNCE=25" >> .env
echo "PADDLE_POWER_MULTIPLIER=2" >> .env
#2v2 uses small sizes, 1v1 uses tall.
#Power goes up to 100 (100%)
#Power multiplier is how strong the boost goes

echo "MATCH_POINT_TO_WIN=3" >> .env
