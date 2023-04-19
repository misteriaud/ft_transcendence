#!/bin/sh
set -e

cd app;
npm install --silent;

# Start the NestJS application.
exec npm run start
