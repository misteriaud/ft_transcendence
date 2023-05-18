#!/bin/sh
set -e

cd app;
npm install --silent --force;

# Start the NestJS application.
exec npm run start
