# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mriaud <mriaud@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/03/20 15:51:23 by spayeur           #+#    #+#              #
#    Updated: 2023/04/19 16:33:59 by mriaud           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Initialize a new build stage and set the latest version of alpine as the     #
# base image for the subsequent instructions.                                  #
ARG  CODE_VERSION=3.17
FROM alpine:${CODE_VERSION}
ENV PORT=${PORT}
ENV REACT_APP_NESTJS_PORT=${REACT_APP_NESTJS_PORT}
ENV REACT_APP_OAUTH_42_UID=${REACT_APP_OAUTH_42_UID}
ENV REACT_APP_OAUTH_CALLBACK_URL=${REACT_APP_OAUTH_CALLBACK_URL}
ENV PORT=${PORT}
ENV DATABASE_URL=${DATABASE_URL}
ENV NESTJS_JWT_SECRET=${NESTJS_JWT_SECRET}
ENV OAUTH_42_UID=${OAUTH_42_UID}
ENV OAUTH_42_SECRET=${OAUTH_42_SECRET}
ENV OAUTH_CALLBACK_URL=${OAUTH_CALLBACK_URL}

RUN apk update && \
	apk add --no-cache npm postgresql-client

WORKDIR /app

# Copy the React application.                                                  #
COPY apps/react /app/front
RUN cd front && npm install --silent --force && npm run build

COPY apps/nestjs /app/back
RUN mv front/build/* back/static
RUN env
RUN cd back && npm install --silent --force && npx prisma generate && npx prisma db push --accept-data-loss --force-reset

WORKDIR /app/back

# Start the React application.                                                 #
ENTRYPOINT ["npm", "run", "start"]
