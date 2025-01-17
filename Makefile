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
	docker compose up --build
	docker ps

#launches the project in the background
silent:
	docker compose up --build -d

#Make the migrations
migrate:
	docker compose run django-web python manage.py makemigrations
	docker compose run django-web python manage.py migrate
	
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