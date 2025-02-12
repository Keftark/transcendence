# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nmascrie <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/12/19 14:01:23 by nmascrie          #+#    #+#              #
#    Updated: 2023/12/19 14:01:24 by nmascrie         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

#launches the project in the foreground
all:
	$(shell ./generate_env.sh)
	docker compose up --build

#launches the project with the logs
logs:
	$(shell ./generate_env.sh)
	docker compose up --build

#launches the project in the background
silent:
	$(shell ./generate_env.sh)
	docker compose up --build -d

#Make the migrations
migration:
	docker exec -it django python manage.py makemigrations accounts
	docker exec -it django python manage.py makemigrations matchs
	docker exec -it django python manage.py makemigrations notifications

migrate:
	docker exec -it django python manage.py migrate
	
show-mig:
	docker exec -it django python manage.py showmigrations

#Does the first launch procedure
first: update key silent migration migrate superuser 
	docker compose logs -f

#Launch the superuser creation procedure
superuser:
	docker exec -it django python manage.py createsuperuser

#Take down the project cleanly
down:
	docker compose down
	
#Take down then restart in background
re:
	docker compose down
	$(shell ./generate_env.sh)
	docker compose up --build -d

#recreates the SSL keys (might need sudo), then puts it
#into the /certs/ folder so that docker can access it
key:
	openssl req -x509 -newkey rsa:4096 -days 365 -nodes \
		-keyout cponmamju2.fr_key.pem -out cponmamju2.fr_key.pem -sha256 \
		-subj "/C=FR/ST=76RPZ/L=LeHavre/O=42 Le Havre/CN=cponmamju.fr" \
		--addext 'subjectAltName=IP:172.17.0.1'
	cp cponmamju2.fr_key.pem certs/

#Recreates the Django container
django-re:
	docker compose build django
	docker compose up --no-deps -d django

#Stops the chat server container
django-down:
	docker compose down django

#Recreates the central server container
central-re:
	docker compose build central
	docker compose up --no-deps -d central

#Stops the chat server container
central-down:
	docker compose down central

#Recreates the game server container
game-re:
	docker compose build 1v1_classic
	docker compose up --no-deps -d 1v1_classic

#Stops the game server container
game-down:
	docker compose down 1v1_classic

#Recreates the game server container
game2-re:
	docker compose build 2v2_classic
	docker compose up --no-deps -d 2v2_classic

#Stops the chat server container
game2-down:
	docker compose down 2v2_classic

#Recreates the chat server container
chat-re:
	docker compose build chat
	docker compose up --no-deps -d chat

#Stops the chat server container
chat-down:
	docker compose down chat

#Redistribute Logger.py to all subprojects
update:
	cp logger.py central/
	cp logger.py back_1v1/
	cp logger.py chat/
	cp logger.py back_2v2/

#Print docker's statuses
status:
	docker ps
	docker network ls
	docker volume ls

#Nuke it all
clean:
	docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\
	docker network rm $$(docker network ls -q);\
	docker system prune

.PHONY: all clean down re

