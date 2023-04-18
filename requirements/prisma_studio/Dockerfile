# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: spayeur <spayeur@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/03/20 15:51:23 by spayeur           #+#    #+#              #
#    Updated: 2023/04/17 11:11:44 by spayeur          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Initialize a new build stage and set the latest version of alpine as the     #
# base image for the subsequent instructions.                                  #
ARG  CODE_VERSION=3.17
FROM alpine:${CODE_VERSION}

# Set the working directory for the subsequent instructions.                   #
WORKDIR /app

# Update package list from repositories then install npm, nodejs,              #
# postgresql-client and prisma.                                                #
RUN apk update && \
	apk add --no-cache npm nodejs postgresql-client && \
	npm install --global prisma && \
	apk del npm

# Copy and run the Prisma studio setup (and startup) script.                   #
COPY tools/prisma_studio_setup.sh .
ENTRYPOINT ["/bin/sh", "prisma_studio_setup.sh"]
