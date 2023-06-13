#!/bin/sh
set -e
#                                                                              #
#                                                         :::      ::::::::    #
#    react_setup.sh                                     :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: spayeur <spayeur@student.42.fr>            +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/04/17 12:40:15 by spayeur           #+#    #+#              #
#    Updated: 2023/04/17 12:44:51 by spayeur          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Build the React application.
npm run build

# Start the React application.
exec node server.mjs