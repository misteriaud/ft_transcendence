# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mriaud <mriaud@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2022/06/13 02:33:30 by spayeur           #+#    #+#              #
#    Updated: 2023/04/19 16:44:10 by mriaud           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# **************************************************************************** #
#                                 Informations                                 #
# **************************************************************************** #

NAME		=	ft_transcendence
COMPOSE		=	docker compose

# **************************************************************************** #
#                                    Rules                                     #
# **************************************************************************** #

all:		$(NAME)

$(NAME):	up

up:
			$(COMPOSE) up --build

down:
			$(COMPOSE) down

clean:
			docker system prune -f

fclean:		down
			-docker stop       $$(docker ps -qa)        2>/dev/null
			-docker rm         $$(docker ps -qa)        2>/dev/null
			-docker rmi -f     $$(docker images -qa)    2>/dev/null
			-docker volume rm  $$(docker volume ls -q)  2>/dev/null
			-docker network rm $$(docker network ls -q) 2>/dev/null
			docker system prune -f

re:			fclean all

.PHONY:		all up down clean fclean re
