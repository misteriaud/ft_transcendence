# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: dimi <dimi@student.42.fr>                  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/03/20 15:51:23 by spayeur           #+#    #+#              #
#    Updated: 2023/05/11 16:39:48 by dimi             ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Initialize a new build stage and set the latest version of alpine as the     #
# base image for the subsequent instructions.                                  #
ARG  CODE_VERSION=3.17
FROM alpine:${CODE_VERSION}

# Set the working directory for the subsequent instructions.                   #
WORKDIR /app

# Update package list from repositories then install npm, postgresql-client    #
# and prisma.                                                                  #
RUN apk update && \
	apk add --no-cache npm postgresql-client && \
	npm install --global prisma

# Copy and run the Prisma studio setup (and startup) script.                   #
COPY tools/prisma_studio_setup.sh .
ENTRYPOINT ["/bin/sh", "prisma_studio_setup.sh"]
