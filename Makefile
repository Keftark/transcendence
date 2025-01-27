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
	docker ps

#launches the project in the background
silent:
	$(shell ./generate_env.sh)
	docker compose up --build -d

#Make the migrations
migrate:
	docker compose run django python manage.py makemigrations -v 3
	docker compose run django python manage.py migrate
	
#Launch the superuser creation procedure
superuser:
	docker compose run django-web python manage.py createsuperuser	

#Take down the project cleanly
down:
	docker compose down
	
#Take down then restart in background
re:
	docker compose down
	docker compose up --build -d

#recreates the SSL keys (might need sudo), then puts it
#into the /certs/ folder so that docker can access it
key:
	openssl req -x509 -newkey rsa:4096 -days 365 -nodes \
		-keyout cponmamju2.fr_key.pem -out cponmamju2.fr_key.pem -sha256 \
		-subj "/C=FR/ST=76RPZ/L=LeHavre/O=42 Le Havre/CN=cponmamju.fr" \
		--addext 'subjectAltName=IP:172.17.0.1'
	cp cponmamju2.fr_key.pem certs/

#Redistribute Logger.py to all subprojects
update:
	cp logger.py central/
	cp logger.py back_1v1/
	cp logger.py chat/

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