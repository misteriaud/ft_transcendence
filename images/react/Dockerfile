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

# Set the working directory for the subsequent instructions.                   #
WORKDIR /app

# Copy the React application and the server.                                   #
COPY app/ .

# Update package list from repositories then install npm, nodejs and React     #
# application dependencies.                                                    #
RUN apk update && \
	apk add --no-cache npm nodejs && \
	npm install --silent

# Build the React application.                                                 #
RUN npm run build

# Start the React application.                                                 #
ENTRYPOINT [ "node", "server.mjs" ]
