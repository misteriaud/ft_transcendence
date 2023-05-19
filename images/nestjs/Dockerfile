# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: dimi <dimi@student.42.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/03/20 15:51:23 by spayeur           #+#    #+#              #
#    Updated: 2023/05/11 16:41:02 by dimi             ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Initialize a new build stage and set the latest version of alpine as the     #
# base image for the subsequent instructions.                                  #
ARG  CODE_VERSION=3.17
FROM alpine:${CODE_VERSION}

# Set the working directory for the subsequent instructions.                   #
# WORKDIR /app

# Copy the NestJS application.                                                 #
# COPY app/ .

# Update package list from repositories then install npm, postgresql-client    #
# and NestJS application dependencies.                                         #
RUN apk update && \
	apk add --no-cache npm postgresql-client
# npm install --silent

# Copy and run the NestJS setup (and startup) script.                          #
COPY tools/nestjs_setup.sh .
ENTRYPOINT ["/bin/sh", "nestjs_setup.sh"]
