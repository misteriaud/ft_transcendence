#!/bin/sh
#                                                                              #
#                                                         :::      ::::::::    #
#    prisma_studio_setup.sh                             :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: spayeur <spayeur@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/04/17 12:40:15 by spayeur           #+#    #+#              #
#    Updated: 2023/04/17 12:44:51 by spayeur          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Wait until the database is up.
while ! pg_isready --dbname=$DATABASE_URL --quiet
do
	sleep 1;
done

cd app

# # Initialize the Prisma shema and its datasource.
# prisma init --url=$DATABASE_URL >/dev/null

# # Perform the pull once the database has been initialized.
# while ! prisma db pull >/dev/null 2>&1
# do
# 	sleep 1;
# done

# Start the Prisma studio application.
exec prisma studio --port $PORT --browser none
