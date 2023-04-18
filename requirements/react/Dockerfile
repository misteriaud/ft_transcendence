# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: spayeur <spayeur@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/03/20 15:51:23 by spayeur           #+#    #+#              #
#    Updated: 2023/04/17 11:11:57 by spayeur          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Initialize a new build stage and set the latest version of alpine as the     #
# base image for the subsequent instructions.                                  #
ARG  CODE_VERSION=3.17
FROM alpine:${CODE_VERSION}

# Set the working directory for the subsequent instructions.                   #
WORKDIR /app

# Copy the React application.                                                  #
COPY app/ .

# Update package list from repositories then install npm and React application #
# dependencies.                                                                #
RUN apk update && \
	apk add --no-cache npm && \
	npm install --silent

# Start the React application.                                                 #
ENTRYPOINT [ "npm", "run", "start" ]
