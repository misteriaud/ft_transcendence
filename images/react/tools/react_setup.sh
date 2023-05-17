#!/bin/sh
set -e

cd app;
npm install;

# Start the NestJS application.
exec npm run start
