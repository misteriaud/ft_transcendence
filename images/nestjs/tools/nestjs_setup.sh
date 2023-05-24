#!/bin/sh
set -e
#                                                                              #
#                                                         :::      ::::::::    #
#    nestjs_setup.sh                                    :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: spayeur <spayeur@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/04/17 12:40:15 by spayeur           #+#    #+#              #
#    Updated: 2023/04/17 12:44:51 by spayeur          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

cd app;

npm install --silent --force;

# Wait until the database is up.
while ! pg_isready --dbname=$DATABASE_URL --quiet
do
	sleep 1;
done

# # Perform the initial migration if the database has not been initialized yet.
npx prisma generate
npx prisma db push --accept-data-loss

# Start the NestJS application.
exec npm run start:dev
