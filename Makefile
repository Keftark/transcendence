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

all:
	@docker-compose -f ./docker-compose.yml up -d --build
	@docker ps
	
down:
	@docker compose -f ./docker-compose.yml down
	
re:
	@docker compose -f ./docker-compose.yml down
	@docker compose -f ./docker-compose.yml up -d --build

status:
	@docker ps
	@docker network ls
	@docker volume ls

clean:
	@docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\
	docker network rm $$(docker network ls -q);\
	rm -rf /home/nmascrie/data/mysql
	rm -rf /home/nmascrie/data/wordpress 
	@docker system prune

.PHONY: all clean down re