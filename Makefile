# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: spayeur <spayeur@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2022/06/13 02:33:30 by spayeur           #+#    #+#              #
#    Updated: 2023/04/17 11:41:27 by spayeur          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# **************************************************************************** #
#                                 Informations                                 #
# **************************************************************************** #

NAME		=	ft_transcendence

# **************************************************************************** #
#                                    Rules                                     #
# **************************************************************************** #

all:		$(NAME)

$(NAME):	up

up:
			docker-compose up --build

down:
			docker-compose down

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
